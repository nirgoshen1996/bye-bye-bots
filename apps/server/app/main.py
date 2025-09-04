import io
import json
import zipfile
import uuid
import jwt
import os
from typing import Optional
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pandas as pd
from datetime import datetime

from .bot_detection import BotDetector
from .models import ColumnMapping, ProcessingSummary, ProcessingOptions
from .supabase import supabase_service
from .stripe_service import stripe_service

app = FastAPI(
    title="Bot Cleaner API",
    description="API for detecting and cleaning bot emails from CSV files",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(authorization: str = Header(None)) -> str:
    """Extract user ID from JWT token in Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Decode JWT token (Supabase uses RS256)
        # For simplicity, we'll use the anon key to verify
        # In production, you should verify with the proper public key
        payload = jwt.decode(
            token, 
            options={"verify_signature": False}  # Skip signature verification for now
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
async def root():
    """Root endpoint providing API information."""
    return {
        "message": "Bot Cleaner API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "process": "/process",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}

@app.post("/process")
async def process_csv(
    file: UploadFile = File(..., description="CSV file to process"),
    mapping: str = Form(..., description="JSON string with column mapping"),
    enable_syntax_check: bool = Query(True, description="Enable email syntax validation"),
    enable_mx_check: bool = Query(True, description="Enable MX record checking"),
    treat_invalid_as_bots: bool = Query(True, description="Treat invalid emails as bots"),
    mx_check_timeout: float = Query(5.0, description="MX check timeout in seconds"),
    bot_threshold: float = Query(1.0, description="Bot detection threshold"),
    user_id: str = Depends(get_current_user)
):
    """
    Process CSV file for bot detection with configurable options.
    
    Args:
        file: CSV file to process
        mapping: JSON string with column mapping
        enable_syntax_check: Enable email syntax validation
        enable_mx_check: Enable MX record checking
        treat_invalid_as_bots: Treat invalid emails as bots
        mx_check_timeout: MX check timeout in seconds
        bot_threshold: Bot detection threshold
        
    Returns:
        ZIP file containing processed CSV files and summary
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV file")
    
    # Parse mapping JSON
    try:
        column_mapping = ColumnMapping(**json.loads(mapping))
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid mapping JSON: {str(e)}")
    
    # Create processing options
    processing_options = ProcessingOptions(
        enable_syntax_check=enable_syntax_check,
        enable_mx_check=enable_mx_check,
        treat_invalid_as_bots=treat_invalid_as_bots,
        mx_check_timeout=mx_check_timeout,
        bot_threshold=bot_threshold
    )
    
    # Read CSV file with memory-safe approach and encoding attempts
    content = await file.read()
    encodings = ['utf-8', 'latin-1', 'cp1252']
    df = None
    
    for encoding in encodings:
        try:
            df = pd.read_csv(io.BytesIO(content), dtype=str, encoding=encoding, on_bad_lines='skip')
            break
        except UnicodeDecodeError:
            continue
    
    if df is None:
        raise HTTPException(status_code=400, detail="Could not read CSV file with any supported encoding")
    
    # Validate CSV data
    if df.empty:
        raise HTTPException(status_code=400, detail="CSV file is empty")
    
    # Check required columns exist
    required_columns = [column_mapping.email]
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise HTTPException(status_code=400, detail=f"Missing required columns: {', '.join(missing_columns)}")
    
    # Initialize bot detector with options
    bot_detector = BotDetector(processing_options)
    
    # Check if user has enough credits
    emails_to_process = len(df)
    try:
        # Check credit balance without deducting yet
        result = supabase_client.table('users').select('credits_balance').eq('id', user_id).execute()
        current_balance = result.data[0]['credits_balance'] if result.data else 0
        
        if current_balance < emails_to_process:
            raise Exception(f"Insufficient credits. You need {emails_to_process} credits to process this file.")
            
    except Exception as e:
        raise HTTPException(status_code=402, detail=str(e))

    # Process data for bot detection
    try:
        clean_df, bots_df, annotated_df, summary = bot_detector.detect_bots(
            df=df,
            email_column=column_mapping.email,
            first_name_column=column_mapping.firstName,
            last_name_column=column_mapping.lastName
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during bot detection: {str(e)}")
    
    # Create ZIP file in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add clean.csv (non-bot rows)
        clean_csv = clean_df.to_csv(index=False, encoding='utf-8-sig')
        zip_file.writestr('clean.csv', clean_csv)
        
        # Add bots.csv (bot rows only)
        bots_csv = bots_df.to_csv(index=False, encoding='utf-8-sig')
        zip_file.writestr('bots.csv', bots_csv)
        
        # Add annotated.csv (all rows with BOT and EMAIL_STATUS columns)
        annotated_csv = annotated_df.to_csv(index=False, encoding='utf-8-sig')
        zip_file.writestr('annotated.csv', annotated_csv)
        
        # Add summary.json
        summary_json = summary.model_dump_json(indent=2)
        zip_file.writestr('summary.json', summary_json)
    
    zip_buffer.seek(0)
    zip_data = zip_buffer.getvalue()
    
    # Upload ZIP to Supabase Storage
    try:
        # Generate unique filename
        run_id = str(uuid.uuid4())
        base_name = file.filename.rsplit('.', 1)[0] if '.' in file.filename else file.filename
        zip_filename = f"{user_id}/{run_id}/{base_name}_processed.zip"
        
        # Upload to storage
        zip_url = await supabase_service.upload_file_to_storage(
            bucket_name="exports",
            file_path=zip_filename,
            file_data=zip_data,
            content_type="application/zip"
        )
        
        # Save run to database
        run_id = await supabase_service.save_run_to_database(
            user_id=user_id,
            filename=file.filename,
            options={
                "enableMxCheck": enable_mx_check,
                "treatInvalidAsBots": treat_invalid_as_bots
            },
            counts=summary.model_dump(),
            zip_url=zip_url
        )
        
        # Update credit deduction with actual run ID
        await stripe_service.deduct_credits(user_id, emails_to_process, run_id)
        
        return {
            "success": True,
            "run_id": run_id,
            "zip_url": zip_url,
            "summary": summary.model_dump()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save results: {str(e)}")

@app.get("/runs")
async def get_user_runs(
    user_id: str = Depends(get_current_user),
    limit: int = Query(10, description="Number of runs to return")
):
    """Get processing runs for the authenticated user."""
    try:
        runs = await supabase_service.get_user_runs(user_id, limit)
        return {"runs": runs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get runs: {str(e)}")

@app.delete("/runs/{run_id}")
async def delete_run(
    run_id: str,
    user_id: str = Depends(get_current_user)
):
    """Delete a processing run."""
    try:
        success = await supabase_service.delete_run(run_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Run not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete run: {str(e)}")

@app.get("/download/{run_id}")
async def download_run(
    run_id: str,
    user_id: str = Depends(get_current_user)
):
    """Get a signed URL for downloading a run's ZIP file."""
    try:
        # Get run details first to verify ownership
        runs = await supabase_service.get_user_runs(user_id, 1000)  # Get more to find the specific run
        run = next((r for r in runs if r["id"] == run_id), None)
        
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")
        
        if not run.get("zip_url"):
            raise HTTPException(status_code=404, detail="ZIP file not available")
        
        # Extract file path from URL
        zip_url = run["zip_url"]
        # Assuming the URL structure, extract the path
        # This might need adjustment based on your actual URL structure
        file_path = zip_url.split("/storage/v1/object/public/exports/")[-1]
        
        # Create signed URL
        signed_url = await supabase_service.create_signed_url(
            bucket_name="exports",
            file_path=file_path,
            expires_in=3600  # 1 hour
        )
        
        return {"download_url": signed_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create download URL: {str(e)}")

@app.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        success = await stripe_service.handle_webhook(payload, sig_header)
        
        if success:
            return {"status": "success"}
        else:
            raise HTTPException(status_code=400, detail="Webhook processing failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook error: {str(e)}")

@app.get("/billing/info")
async def get_billing_info(user_id: str = Depends(get_current_user)):
    """Get user's billing information"""
    try:
        billing_info = await stripe_service.get_user_billing_info(user_id)
        return billing_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get billing info: {str(e)}")

@app.post("/billing/create-checkout")
async def create_checkout_session(
    request: Request,
    user_id: str = Depends(get_current_user)
):
    """Create a Stripe checkout session"""
    try:
        body = await request.json()
        price_id = body.get("price_id")
        success_url = body.get("success_url")
        cancel_url = body.get("cancel_url")
        mode = body.get("mode", "subscription")
        
        if not all([price_id, success_url, cancel_url]):
            raise HTTPException(status_code=400, detail="Missing required parameters")
        
        session = await stripe_service.create_checkout_session(
            user_id=user_id,
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url,
            mode=mode
        )
        
        return session
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@app.post("/billing/create-portal")
async def create_portal_session(
    request: Request,
    user_id: str = Depends(get_current_user)
):
    """Create a customer portal session"""
    try:
        body = await request.json()
        return_url = body.get("return_url")
        
        if not return_url:
            raise HTTPException(status_code=400, detail="Missing return_url parameter")
        
        portal_url = await stripe_service.create_portal_session(user_id, return_url)
        return {"url": portal_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create portal session: {str(e)}")

def create_zip_response(
    clean_df: pd.DataFrame,
    bots_df: pd.DataFrame,
    annotated_df: pd.DataFrame,
    summary: ProcessingSummary,
    filename: str
) -> StreamingResponse:
    """Create a streaming ZIP response with processed CSV files."""
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add clean.csv (non-bot rows)
        clean_csv = clean_df.to_csv(index=False, encoding='utf-8-sig')
        zip_file.writestr('clean.csv', clean_csv)
        
        # Add bots.csv (bot rows only)
        bots_csv = bots_df.to_csv(index=False, encoding='utf-8-sig')
        zip_file.writestr('bots.csv', bots_csv)
        
        # Add annotated.csv (all rows with BOT and EMAIL_STATUS columns)
        annotated_csv = annotated_df.to_csv(index=False, encoding='utf-8-sig')
        zip_file.writestr('annotated.csv', annotated_csv)
        
        # Add summary.json
        summary_json = summary.model_dump_json(indent=2)
        zip_file.writestr('summary.json', summary_json)
    
    zip_buffer.seek(0)
    
    # Generate filename for download
    base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
    zip_filename = f"{base_name}_processed.zip"
    
    def generate_zip():
        """Generate ZIP content in chunks for streaming."""
        chunk_size = 8192
        while True:
            chunk = zip_buffer.read(chunk_size)
            if not chunk:
                break
            yield chunk
        zip_buffer.close()
    
    response = StreamingResponse(
        generate_zip(),
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={zip_filename}",
            "Content-Type": "application/zip"
        }
    )
    
    return response
