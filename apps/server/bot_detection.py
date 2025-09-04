from typing import Dict, List, Tuple, Optional
from datetime import datetime
import pandas as pd
from app.bot_rules import BotDetector as BotRulesDetector, BotDetectionConfig
from app.models import ProcessingOptions

class BotDetector:
    """Bot detection logic for CSV data analysis using scoring-based rules."""

    def __init__(self, options: Optional[ProcessingOptions] = None):
        # Create bot detection config from processing options
        config = BotDetectionConfig()
        if options:
            config.ENABLE_SYNTAX_CHECK = options.enable_syntax_check
            config.ENABLE_MX_CHECK = options.enable_mx_check
            config.TREAT_INVALID_AS_BOTS = options.treat_invalid_as_bots
            config.MX_CHECK_TIMEOUT = options.mx_check_timeout
            config.BOT_THRESHOLD = options.bot_threshold
        
        self.bot_rules_detector = BotRulesDetector(config)
        self.options = options or ProcessingOptions()

    def is_bot_email(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> bool:
        """Check if an email address matches bot patterns using scoring rules."""
        return self.bot_rules_detector.is_bot_email(email, first_name, last_name)

    def get_email_status(self, email: str) -> str:
        """Get the email verification status."""
        return self.bot_rules_detector.get_email_status(email)

    def detect_bots(self, df: pd.DataFrame, email_column: str,
                   first_name_column: Optional[str] = None,
                   last_name_column: Optional[str] = None) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict]:
        """
        Detect bots in CSV data and return clean, bot, and annotated DataFrames.
        
        Args:
            df: Input DataFrame
            email_column: Name of the email column
            first_name_column: Optional name of the first name column
            last_name_column: Optional name of the last name column
            
        Returns:
            Tuple of (clean_df, bots_df, annotated_df, summary)
        """
        df = df.copy()
        
        if email_column not in df.columns:
            raise ValueError(f"Email column '{email_column}' not found in CSV")

        # Add BOT and EMAIL_STATUS columns
        df['BOT'] = 'UNKNOWN'
        df['EMAIL_STATUS'] = 'unknown'
        
        # Process rows with email addresses
        email_mask = df[email_column].notna() & (df[email_column] != '') & (df[email_column].str.strip() != '')
        
        def classify_row(row):
            email = row[email_column]
            first_name = row.get(first_name_column) if first_name_column else None
            last_name = row.get(last_name_column) if last_name_column else None
            
            # Get email status
            email_status = self.get_email_status(email)
            row['EMAIL_STATUS'] = email_status
            
            # Determine bot status
            is_bot = self.is_bot_email(email, first_name, last_name)
            return 'TRUE' if is_bot else 'FALSE'

        # Apply classification to rows with emails
        df.loc[email_mask, 'BOT'] = df.loc[email_mask].apply(classify_row, axis=1)
        
        # Set EMAIL_STATUS for rows with emails
        df.loc[email_mask, 'EMAIL_STATUS'] = df.loc[email_mask][email_column].apply(self.get_email_status)

        # Separate clean and bot rows
        clean_df = df[df['BOT'] != 'TRUE'].copy()
        bots_df = df[df['BOT'] == 'TRUE'].copy()

        # Calculate summary statistics
        total_rows = len(df)
        rows_with_email = email_mask.sum()
        rows_without_email = total_rows - rows_with_email
        bots_count = len(bots_df)
        clean_count = len(clean_df)

        # Count email statuses
        valid_emails = len(df[df['EMAIL_STATUS'] == 'valid'])
        invalid_syntax_emails = len(df[df['EMAIL_STATUS'] == 'invalid_syntax'])
        no_mx_emails = len(df[df['EMAIL_STATUS'] == 'no_mx'])
        unknown_emails = len(df[df['EMAIL_STATUS'] == 'unknown'])

        summary = {
            'total_rows': total_rows,
            'rows_with_email': int(rows_with_email),
            'rows_without_email': int(rows_without_email),
            'bots_count': bots_count,
            'clean_count': clean_count,
            'valid_emails': valid_emails,
            'invalid_syntax_emails': invalid_syntax_emails,
            'no_mx_emails': no_mx_emails,
            'unknown_emails': unknown_emails,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'processing_options': self.options
        }

        return clean_df, bots_df, df, summary

    def validate_csv_data(self, df: pd.DataFrame, required_columns: List[str]) -> List[str]:
        """Validate CSV data structure and content."""
        errors = []
        
        # Check required columns exist
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            errors.append(f"Missing required columns: {', '.join(missing_columns)}")
        
        # Check for empty DataFrame
        if df.empty:
            errors.append("CSV file is empty")
        
        # Check for reasonable row count
        if len(df) > 1000000:  # 1 million rows limit
            errors.append("CSV file too large (max 1 million rows)")
        
        return errors

    def get_detection_details(self, email: str, first_name: Optional[str] = None, last_name: Optional[str] = None) -> Dict:
        """Get detailed bot detection analysis for debugging and tuning."""
        return self.bot_rules_detector.get_detection_details(email, first_name, last_name)
