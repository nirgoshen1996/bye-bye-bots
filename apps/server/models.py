from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional

class BotStatus(str, Enum):
    """Bot detection status values."""
    TRUE = "TRUE"
    FALSE = "FALSE"
    UNKNOWN = "UNKNOWN"

class EmailStatus(str, Enum):
    """Email verification status values."""
    VALID = "valid"
    INVALID_SYNTAX = "invalid_syntax"
    NO_MX = "no_mx"
    UNKNOWN = "unknown"

class ColumnMapping(BaseModel):
    """Column mapping configuration for CSV processing."""
    email: str = Field(..., description="Column name containing email addresses")
    firstName: Optional[str] = Field(None, description="Column name containing first names")
    lastName: Optional[str] = Field(None, description="Column name containing last names")

class ProcessingOptions(BaseModel):
    """Configuration options for CSV processing and bot detection."""
    enable_syntax_check: bool = Field(True, description="Enable email syntax validation")
    enable_mx_check: bool = Field(True, description="Enable MX record checking")
    treat_invalid_as_bots: bool = Field(True, description="Treat invalid emails as bots")
    mx_check_timeout: float = Field(5.0, description="MX check timeout in seconds")
    bot_threshold: float = Field(1.0, description="Bot detection threshold")

class ProcessingSummary(BaseModel):
    """Summary of CSV processing results."""
    total_rows: int = Field(..., description="Total number of rows processed")
    rows_with_email: int = Field(..., description="Number of rows with email addresses")
    rows_without_email: int = Field(..., description="Number of rows without email addresses")
    bots_count: int = Field(..., description="Number of rows classified as bots")
    clean_count: int = Field(..., description="Number of rows classified as clean")
    
    # Email status breakdown
    valid_emails: int = Field(..., description="Number of emails with valid syntax and MX records")
    invalid_syntax_emails: int = Field(..., description="Number of emails with invalid syntax")
    no_mx_emails: int = Field(..., description="Number of emails with no MX records")
    unknown_emails: int = Field(..., description="Number of emails with unknown status")
    
    timestamp: str = Field(..., description="Processing timestamp in ISO format")
    processing_options: ProcessingOptions = Field(..., description="Options used for processing")

class ErrorResponse(BaseModel):
    """Standard error response format."""
    error: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
