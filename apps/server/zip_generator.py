import io
import zipfile
import json
import pandas as pd
from typing import Dict, Optional
from fastapi.responses import StreamingResponse

class ZipGenerator:
    """Generate ZIP files containing processed CSV data and summary."""
    
    @staticmethod
    def create_zip_response(clean_df: pd.DataFrame, bots_df: pd.DataFrame, 
                          annotated_df: pd.DataFrame, summary: Dict, 
                          filename: str) -> StreamingResponse:
        """
        Create a streaming ZIP response with processed CSV files and summary.
        
        Args:
            clean_df: DataFrame with clean (non-bot) data
            bots_df: DataFrame with bot data only
            annotated_df: DataFrame with original data plus BOT column
            summary: Summary statistics dictionary
            filename: Original filename for the ZIP
            
        Returns:
            StreamingResponse with ZIP file
        """
        # Create ZIP file in memory
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Add clean.csv
            clean_csv = clean_df.to_csv(index=False)
            zip_file.writestr('clean.csv', clean_csv)
            
            # Add bots.csv
            bots_csv = bots_df.to_csv(index=False)
            zip_file.writestr('bots.csv', bots_csv)
            
            # Add annotated.csv
            annotated_csv = annotated_df.to_csv(index=False)
            zip_file.writestr('annotated.csv', annotated_csv)
            
            # Add summary.json
            summary_json = json.dumps(summary, indent=2)
            zip_file.writestr('summary.json', summary_json)
        
        # Reset buffer position
        zip_buffer.seek(0)
        
        # Generate ZIP filename
        base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
        zip_filename = f"{base_name}_processed.zip"
        
        # Create streaming response
        response = StreamingResponse(
            io.BytesIO(zip_buffer.getvalue()),
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename={zip_filename}",
                "Content-Type": "application/zip"
            }
        )
        
        return response
    
    @staticmethod
    def validate_dataframes(clean_df: pd.DataFrame, bots_df: pd.DataFrame, 
                           annotated_df: pd.DataFrame) -> bool:
        """Validate that the dataframes are properly formatted."""
        try:
            # Check if all are DataFrames
            if not all(isinstance(df, pd.DataFrame) for df in [clean_df, bots_df, annotated_df]):
                return False
            
            # Check if annotated_df has BOT column
            if 'BOT' not in annotated_df.columns:
                return False
            
            # Check if BOT column has valid values
            valid_bot_values = {'TRUE', 'FALSE', 'UNKNOWN'}
            if not annotated_df['BOT'].isin(valid_bot_values).all():
                return False
            
            return True
        except Exception:
            return False

