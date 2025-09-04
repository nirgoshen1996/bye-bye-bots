import pytest
import tempfile
import os
import json
import zipfile
import io
import pandas as pd
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Import the FastAPI app
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from main import app

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)

@pytest.fixture
def sample_csv_data():
    """Sample CSV data for testing."""
    return {
        'email': [
            'john.doe@gmail.com',
            'jane.smith@company.com',
            'bot@mailinator.com',
            'test@company.com',
            'admin@company.com',
            'xq7k9m2n4p8r@company.com',
            'noreply@tempmail.org',
            'user123@outlook.com',
            'info@company.com',
            '',  # Empty email
            'invalid-email',  # Invalid email
            'test@nonexistentdomain12345.com',  # No MX records
        ],
        'first_name': [
            'John',
            'Jane',
            'Bot',
            'Test',
            'Admin',
            'User',
            'NoReply',
            'User',
            'Info',
            'NoName',
            'Invalid',
            'TestUser',
        ],
        'last_name': [
            'Doe',
            'Smith',
            'User',
            'User',
            'User',
            'Name',
            'User',
            'Person',
            'User',
            'User',
            'User',
            'Test',
        ],
        'company': [
            'Gmail',
            'Company',
            'Mailinator',
            'Company',
            'Company',
            'Company',
            'TempMail',
            'Outlook',
            'Company',
            'Company',
            'Company',
            'TestCompany',
        ]
    }

@pytest.fixture
def sample_csv_file(sample_csv_data):
    """Create a temporary CSV file for testing."""
    df = pd.DataFrame(sample_csv_data)

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
        df.to_csv(temp_file.name, index=False)
        temp_file_path = temp_file.name

    yield temp_file_path

    # Cleanup
    os.unlink(temp_file_path)

@pytest.fixture
def valid_mapping():
    """Valid column mapping for testing."""
    return {
        "email": "email",
        "firstName": "first_name",
        "lastName": "last_name"
    }

class TestHealthEndpoint:
    """Test the /health endpoint."""

    def test_health_returns_ok(self, client):
        """Test that /health returns {status: "ok"}."""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

class TestProcessEndpoint:
    """Test the /process endpoint."""

    def test_process_with_valid_csv_returns_zip(self, client, sample_csv_file, valid_mapping):
        """Test that /process returns a ZIP file with valid CSV input."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 200
        assert response.headers['content-type'] == 'application/zip'
        assert 'attachment' in response.headers['content-disposition']
        assert 'filename' in response.headers['content-disposition']

        # Verify ZIP content
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            file_list = zip_file.namelist()
            assert 'clean.csv' in file_list
            assert 'bots.csv' in file_list
            assert 'annotated.csv' in file_list
            assert 'summary.json' in file_list

    def test_process_creates_annotated_csv_with_bot_and_email_status_columns(self, client, sample_csv_file, valid_mapping):
        """Test that annotated.csv contains both BOT and EMAIL_STATUS columns."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 200

        # Extract and verify annotated.csv
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            with zip_file.open('annotated.csv') as f:
                annotated_df = pd.read_csv(f, encoding='utf-8-sig')

                # Check both columns exist
                assert 'BOT' in annotated_df.columns
                assert 'EMAIL_STATUS' in annotated_df.columns

                # Check BOT column values
                bot_values = annotated_df['BOT'].unique()
                assert 'TRUE' in bot_values  # Bot rows
                assert 'FALSE' in bot_values  # Clean rows
                assert 'UNKNOWN' in bot_values  # Rows without email

                # Check EMAIL_STATUS column values
                email_status_values = annotated_df['EMAIL_STATUS'].unique()
                assert 'valid' in email_status_values
                assert 'invalid_syntax' in email_status_values
                assert 'unknown' in email_status_values

    def test_process_creates_clean_csv_without_bots(self, client, sample_csv_file, valid_mapping):
        """Test that clean.csv contains only non-bot rows and rows without email."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 200

        # Extract and verify clean.csv
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            with zip_file.open('clean.csv') as f:
                clean_df = pd.read_csv(f, encoding='utf-8-sig')

                # Should not contain any TRUE bot rows
                if 'BOT' in clean_df.columns:
                    assert 'TRUE' not in clean_df['BOT'].values

                # Should contain FALSE and UNKNOWN rows
                bot_values = clean_df['BOT'].unique()
                assert 'FALSE' in bot_values or 'UNKNOWN' in bot_values

    def test_process_creates_bots_csv_only_bots(self, client, sample_csv_file, valid_mapping):
        """Test that bots.csv contains only bot rows."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 200

        # Extract and verify bots.csv
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            with zip_file.open('bots.csv') as f:
                bots_df = pd.read_csv(f, encoding='utf-8-sig')

                # Should only contain TRUE bot rows
                if 'BOT' in bots_df.columns:
                    assert all(bots_df['BOT'] == 'TRUE')

                # Should not contain FALSE or UNKNOWN rows
                bot_values = bots_df['BOT'].unique()
                assert 'FALSE' not in bot_values
                assert 'UNKNOWN' not in bot_values

    def test_process_creates_enhanced_summary_json(self, client, sample_csv_file, valid_mapping):
        """Test that summary.json contains enhanced processing statistics."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 200

        # Extract and verify summary.json
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            with zip_file.open('summary.json') as f:
                summary = json.load(f)

                # Check required fields
                required_fields = [
                    'total_rows', 'rows_with_email', 'rows_without_email',
                    'bots_count', 'clean_count', 'timestamp'
                ]
                for field in required_fields:
                    assert field in summary

                # Check new email status fields
                email_status_fields = [
                    'valid_emails', 'invalid_syntax_emails', 'no_mx_emails', 'unknown_emails'
                ]
                for field in email_status_fields:
                    assert field in summary

                # Check processing options
                assert 'processing_options' in summary
                processing_options = summary['processing_options']
                assert 'enable_syntax_check' in processing_options
                assert 'enable_mx_check' in processing_options
                assert 'treat_invalid_as_bots' in processing_options
                assert 'mx_check_timeout' in processing_options
                assert 'bot_threshold' in processing_options

                # Check data types
                assert isinstance(summary['total_rows'], int)
                assert isinstance(summary['rows_with_email'], int)
                assert isinstance(summary['rows_without_email'], int)
                assert isinstance(summary['bots_count'], int)
                assert isinstance(summary['clean_count'], int)
                assert isinstance(summary['timestamp'], str)

                # Check logical consistency
                assert summary['total_rows'] > 0
                assert summary['total_rows'] == summary['rows_with_email'] + summary['rows_without_email']
                assert summary['clean_count'] + summary['bots_count'] == summary['total_rows']

    def test_process_with_custom_processing_options(self, client, sample_csv_file, valid_mapping):
        """Test that /process accepts and applies custom processing options."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            # Test with custom options
            response = client.post(
                "/process",
                files=files,
                data=data,
                params={
                    'enable_syntax_check': 'false',
                    'enable_mx_check': 'false',
                    'treat_invalid_as_bots': 'false',
                    'mx_check_timeout': '10.0',
                    'bot_threshold': '0.5'
                }
            )

        assert response.status_code == 200

        # Verify the options were applied by checking summary.json
        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            with zip_file.open('summary.json') as f:
                summary = json.load(f)
                processing_options = summary['processing_options']

                assert processing_options['enable_syntax_check'] == False
                assert processing_options['enable_mx_check'] == False
                assert processing_options['treat_invalid_as_bots'] == False
                assert processing_options['mx_check_timeout'] == 10.0
                assert processing_options['bot_threshold'] == 0.5

    def test_process_with_missing_email_column_returns_error(self, client, sample_csv_file):
        """Test that /process returns error when email column is missing."""
        invalid_mapping = {
            "firstName": "first_name",
            "lastName": "last_name"
        }

        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(invalid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 400
        error_data = response.json()
        assert 'error' in error_data or 'detail' in error_data

    def test_process_with_invalid_csv_returns_error(self, client):
        """Test that /process returns error with invalid CSV."""
        # Create invalid CSV content
        invalid_csv_content = "invalid,csv,content\nwith,malformed,data"

        files = {'file': ('invalid.csv', io.BytesIO(invalid_csv_content.encode()), 'text/csv')}
        data = {'mapping': json.dumps({"email": "email"})}

        response = client.post("/process", files=files, data=data)

        assert response.status_code == 400
        error_data = response.json()
        assert 'error' in error_data or 'detail' in error_data

    def test_process_with_non_csv_file_returns_error(self, client):
        """Test that /process returns error with non-CSV file."""
        # Create text file instead of CSV
        text_content = "This is not a CSV file"

        files = {'file': ('test.txt', io.BytesIO(text_content.encode()), 'text/plain')}
        data = {'mapping': json.dumps({"email": "email"})}

        response = client.post("/process", files=files, data=data)

        assert response.status_code == 400
        error_data = response.json()
        assert 'error' in error_data or 'detail' in error_data

    def test_process_with_invalid_mapping_json_returns_error(self, client, sample_csv_file):
        """Test that /process returns error with invalid mapping JSON."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': 'invalid json'}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 400
        error_data = response.json()
        assert 'error' in error_data or 'detail' in error_data

    def test_process_preserves_original_columns(self, client, sample_csv_file, valid_mapping):
        """Test that all original CSV columns are preserved in output files."""
        with open(sample_csv_file, 'rb') as f:
            files = {'file': ('test_data.csv', f, 'text/csv')}
            data = {'mapping': json.dumps(valid_mapping)}

            response = client.post("/process", files=files, data=data)

        assert response.status_code == 200

        # Check that all original columns are preserved
        original_columns = ['email', 'first_name', 'last_name', 'company']

        zip_content = response.content
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            # Check annotated.csv (should have all original + BOT + EMAIL_STATUS columns)
            with zip_file.open('annotated.csv') as f:
                annotated_df = pd.read_csv(f, encoding='utf-8-sig')
                for col in original_columns:
                    assert col in annotated_df.columns
                assert 'BOT' in annotated_df.columns
                assert 'EMAIL_STATUS' in annotated_df.columns

            # Check clean.csv
            with zip_file.open('clean.csv') as f:
                clean_df = pd.read_csv(f, encoding='utf-8-sig')
                for col in original_columns:
                    assert col in clean_df.columns

            # Check bots.csv
            with zip_file.open('bots.csv') as f:
                bots_df = pd.read_csv(f, encoding='utf-8-sig')
                for col in original_columns:
                    assert col in bots_df.columns

class TestRootEndpoint:
    """Test the root endpoint."""

    def test_root_returns_api_info(self, client):
        """Test that root endpoint returns API information."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert 'message' in data
        assert 'version' in data
        assert 'endpoints' in data
        assert data['message'] == 'Bot Cleaner API'
