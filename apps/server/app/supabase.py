"""
Supabase client configuration for the server application
"""

import os
from supabase import create_client, Client
from typing import Optional, Dict, Any
import json

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
        
        self.client: Client = create_client(self.url, self.key)
    
    async def upload_file_to_storage(
        self, 
        bucket_name: str, 
        file_path: str, 
        file_data: bytes,
        content_type: str = "application/zip"
    ) -> str:
        """Upload a file to Supabase Storage and return the public URL"""
        try:
            # Upload the file
            result = self.client.storage.from_(bucket_name).upload(
                path=file_path,
                file=file_data,
                file_options={"content-type": content_type}
            )
            
            if result.get("error"):
                raise Exception(f"Storage upload error: {result['error']}")
            
            # Get the public URL
            public_url = self.client.storage.from_(bucket_name).get_public_url(file_path)
            return public_url
            
        except Exception as e:
            raise Exception(f"Failed to upload file to storage: {str(e)}")
    
    async def create_signed_url(
        self, 
        bucket_name: str, 
        file_path: str, 
        expires_in: int = 3600
    ) -> str:
        """Create a signed URL for a file in Supabase Storage"""
        try:
            result = self.client.storage.from_(bucket_name).create_signed_url(
                path=file_path,
                expires_in=expires_in
            )
            
            if result.get("error"):
                raise Exception(f"Signed URL creation error: {result['error']}")
            
            return result["signedURL"]
            
        except Exception as e:
            raise Exception(f"Failed to create signed URL: {str(e)}")
    
    async def save_run_to_database(
        self,
        user_id: str,
        filename: str,
        options: Dict[str, Any],
        counts: Dict[str, Any],
        zip_url: Optional[str] = None
    ) -> str:
        """Save a processing run to the database"""
        try:
            run_data = {
                "user_id": user_id,
                "filename": filename,
                "options": options,
                "counts": counts,
                "zip_url": zip_url
            }
            
            result = self.client.table("runs").insert(run_data).execute()
            
            if result.data:
                return result.data[0]["id"]
            else:
                raise Exception("Failed to save run to database")
                
        except Exception as e:
            raise Exception(f"Failed to save run to database: {str(e)}")
    
    async def get_user_runs(self, user_id: str, limit: int = 10) -> list:
        """Get processing runs for a specific user"""
        try:
            result = self.client.table("runs")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data if result.data else []
            
        except Exception as e:
            raise Exception(f"Failed to get user runs: {str(e)}")
    
    async def delete_run(self, run_id: str, user_id: str) -> bool:
        """Delete a processing run (with user verification)"""
        try:
            result = self.client.table("runs")\
                .delete()\
                .eq("id", run_id)\
                .eq("user_id", user_id)\
                .execute()
            
            return len(result.data) > 0 if result.data else False
            
        except Exception as e:
            raise Exception(f"Failed to delete run: {str(e)}")

# Global instance
supabase_service = SupabaseService()

