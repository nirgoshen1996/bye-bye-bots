# Testing Guide for Bot Cleaner SaaS

This document provides comprehensive testing instructions for both the frontend (Playwright) and backend (pytest) components of the Bot Cleaner application.

## 🎯 Testing Overview

### **Frontend Tests (Playwright)**
- **Location**: `apps/web/tests/`
- **Framework**: Playwright
- **Coverage**: End-to-end user workflows, UI interactions, file uploads, downloads
- **Browser Support**: Chrome, Firefox, Safari

### **Backend Tests (pytest)**
- **Location**: `apps/server/tests/`
- **Framework**: pytest
- **Coverage**: API endpoints, bot detection logic, CSV processing, error handling
- **Dependencies**: FastAPI TestClient, pandas, zipfile

## 🚀 Quick Start

### **Prerequisites**
1. **Frontend**: Node.js 18+, npm dependencies installed
2. **Backend**: Python 3.11+, pip dependencies installed
3. **Services**: Frontend running on port 3000, backend on port 8000

### **Install Dependencies**

#### **Frontend (Playwright)**
```bash
cd apps/web
npm install
npx playwright install
```

#### **Backend (pytest)**
```bash
cd apps/server
pip install -r requirements.txt
```

## 🧪 Frontend Testing (Playwright)

### **Running Tests**

#### **All Tests**
```bash
cd apps/web
npm run test:e2e
```

#### **Interactive Mode**
```bash
npm run test:e2e:ui
```

#### **Debug Mode**
```bash
npm run test:e2e:debug
```

#### **Specific Browser**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### **Test Coverage**

#### **1. CSV Processing Workflow**
- **File Upload**: CSV parsing, preview generation, validation
- **Column Mapping**: Auto-detection, manual selection, validation
- **Processing**: Progress indicators, API integration, error handling
- **Results**: Statistics display, download functionality, file validation

#### **2. User Experience**
- **Navigation**: Page routing, back/forward navigation
- **Responsiveness**: Mobile/desktop layouts, component interactions
- **Error Handling**: Validation messages, error states, recovery actions
- **Accessibility**: Screen reader support, keyboard navigation

#### **3. File Operations**
- **Upload**: Drag & drop, file selection, format validation
- **Download**: ZIP extraction, file naming, content validation
- **Preview**: CSV parsing, table rendering, data display

### **Test Scenarios**

#### **Happy Path**
```typescript
test('should complete full CSV processing workflow', async ({ page }) => {
  // 1. Navigate to upload page
  // 2. Upload CSV file
  // 3. Proceed to mapping
  // 4. Verify auto-detection
  // 5. Continue to results
  // 6. Wait for processing
  // 7. Verify statistics
  // 8. Download and validate files
});
```

#### **Error Handling**
```typescript
test('should handle missing email column gracefully', async ({ page }) => {
  // Upload CSV without email column
  // Verify error handling and validation
});
```

#### **Progress Tracking**
```typescript
test('should show progress indicators during processing', async ({ page }) => {
  // Verify progress bars and status messages
  // Check phase transitions (uploading → processing → complete)
});
```

### **Test Data**

#### **Sample CSV**
```csv
email,first_name,last_name,company
john.doe@gmail.com,John,Doe,Company A
jane.smith@company.com,Jane,Smith,Company B
bot@mailinator.com,Bot,User,Company C
test@company.com,Test,User,Company D
admin@company.com,Admin,User,Company E
```

#### **Expected Results**
- **Total Rows**: 5
- **Bots Found**: 3 (disposable domain, test email, role account)
- **Clean Rows**: 2 (human emails with names)

### **Browser Compatibility**

#### **Chrome**
- ✅ File upload/download
- ✅ ZIP extraction
- ✅ Progress indicators
- ✅ Error handling

#### **Firefox**
- ✅ File upload/download
- ✅ ZIP extraction
- ✅ Progress indicators
- ✅ Error handling

#### **Safari**
- ✅ File upload/download
- ✅ ZIP extraction
- ✅ Progress indicators
- ✅ Error handling

## 🔧 Backend Testing (pytest)

### **Running Tests**

#### **All Tests**
```bash
cd apps/server
python run_pytest.py
```

#### **Direct pytest**
```bash
pytest tests/ -v
```

#### **Specific Test Class**
```bash
pytest tests/test_api.py::TestProcessEndpoint -v
```

#### **Specific Test Method**
```bash
pytest tests/test_api.py::TestProcessEndpoint::test_process_with_valid_csv_returns_zip -v
```

### **Test Coverage**

#### **1. Health Endpoint**
```python
def test_health_returns_ok(self, client):
    """Test that /health returns {status: "ok"}."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

#### **2. Process Endpoint**
- **Valid CSV Processing**: ZIP generation, file content validation
- **Bot Detection**: TRUE/FALSE/UNKNOWN classification
- **Output Files**: clean.csv, bots.csv, annotated.csv, summary.json
- **Error Handling**: Invalid files, missing columns, malformed data

#### **3. Data Validation**
- **Column Preservation**: Original CSV structure maintained
- **Bot Classification**: Scoring-based detection logic
- **Summary Statistics**: Processing metrics and validation

### **Test Fixtures**

#### **Sample CSV Data**
```python
@pytest.fixture
def sample_csv_data():
    """Sample CSV data for testing."""
    return {
        'email': [
            'john.doe@gmail.com',      # Human email
            'bot@mailinator.com',      # Disposable domain
            'test@company.com',        # Test local-part
            'admin@company.com',       # Role account
            '',                        # Empty email
            'invalid-email',           # Invalid email
        ],
        'first_name': ['John', 'Bot', 'Test', 'Admin', 'NoName', 'Invalid'],
        'last_name': ['Doe', 'User', 'User', 'User', 'User', 'User'],
        'company': ['Gmail', 'Mailinator', 'Company', 'Company', 'Company', 'Company']
    }
```

#### **Valid Mapping**
```python
@pytest.fixture
def valid_mapping():
    """Valid column mapping for testing."""
    return {
        "email": "email",
        "firstName": "first_name",
        "lastName": "last_name"
    }
```

### **Test Scenarios**

#### **Successful Processing**
```python
def test_process_with_valid_csv_returns_zip(self, client, sample_csv_file, valid_mapping):
    """Test that /process returns a ZIP file with valid CSV input."""
    # Upload CSV and mapping
    # Verify 200 response
    # Check ZIP content and headers
    # Validate file structure
```

#### **Bot Detection Validation**
```python
def test_process_creates_annotated_csv_with_bot_column(self, client, sample_csv_file, valid_mapping):
    """Test that annotated.csv contains BOT column with TRUE/FALSE/UNKNOWN values."""
    # Process CSV
    # Extract annotated.csv from ZIP
    # Verify BOT column exists
    # Check classification values
    # Validate specific bot detection results
```

#### **Error Handling**
```python
def test_process_with_missing_email_column_returns_error(self, client, sample_csv_file):
    """Test that /process returns error when email column is missing."""
    # Submit mapping without email
    # Verify 400 response
    # Check error message
```

## 📊 Test Results Validation

### **Frontend Test Results**

#### **Expected Output**
```
🧪 Running Bot Cleaner Frontend Tests
============================================================
✓ should complete full CSV processing workflow (2.3s)
✓ should handle missing email column gracefully (1.1s)
✓ should show progress indicators during processing (3.2s)
✓ should handle processing errors gracefully (0.8s)
✓ should download all three file types correctly (4.1s)

5 passed, 0 failed (11.5s)
```

### **Backend Test Results**

#### **Expected Output**
```
🧪 Running Bot Cleaner Backend Tests with pytest
============================================================
tests/test_api.py::TestHealthEndpoint::test_health_returns_ok PASSED
tests/test_api.py::TestProcessEndpoint::test_process_with_valid_csv_returns_zip PASSED
tests/test_api.py::TestProcessEndpoint::test_process_creates_annotated_csv_with_bot_column PASSED
tests/test_api.py::TestProcessEndpoint::test_process_creates_clean_csv_without_bots PASSED
tests/test_api.py::TestProcessEndpoint::test_process_creates_bots_csv_only_bots PASSED
tests/test_api.py::TestProcessEndpoint::test_process_creates_summary_json PASSED
tests/test_api.py::TestProcessEndpoint::test_process_with_missing_email_column_returns_error PASSED
tests/test_api.py::TestProcessEndpoint::test_process_with_invalid_csv_returns_error PASSED
tests/test_api.py::TestProcessEndpoint::test_process_with_non_csv_file_returns_error PASSED
tests/test_api.py::TestProcessEndpoint::test_process_with_invalid_mapping_json_returns_error PASSED
tests/test_api.py::TestProcessEndpoint::test_process_preserves_original_columns PASSED
tests/test_api.py::TestRootEndpoint::test_root_returns_api_info PASSED

12 passed, 0 failed
```

## 🐛 Troubleshooting

### **Common Frontend Test Issues**

#### **Tests Fail to Start**
```bash
# Check if frontend is running
curl http://localhost:3000

# Install Playwright browsers
npx playwright install

# Clear Playwright cache
npx playwright install --force
```

#### **File Upload Issues**
```bash
# Check test data directory
ls -la apps/web/test-data/

# Verify CSV file format
file apps/web/test-data/sample.csv
```

#### **Download Validation Fails**
```bash
# Check ZIP file content
unzip -l downloaded_file.zip

# Verify CSV encoding
file downloaded_file.csv
```

### **Common Backend Test Issues**

#### **Import Errors**
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Install dependencies
pip install -r requirements.txt

# Run from correct directory
cd apps/server && python run_pytest.py
```

#### **Test Client Issues**
```bash
# Check FastAPI app import
python -c "from main import app; print(app)"

# Verify app structure
ls -la apps/server/app/
```

#### **File Handling Issues**
```bash
# Check temporary file permissions
ls -la /tmp/

# Verify pandas installation
python -c "import pandas; print(pandas.__version__)"
```

## 🔄 Continuous Integration

### **GitHub Actions Example**

#### **Frontend Tests**
```yaml
- name: Run Frontend Tests
  run: |
    cd apps/web
    npm install
    npx playwright install --with-deps
    npm run test:e2e
```

#### **Backend Tests**
```yaml
- name: Run Backend Tests
  run: |
    cd apps/server
    pip install -r requirements.txt
    python run_pytest.py
```

### **Local CI Setup**
```bash
# Run all tests locally
cd apps/web && npm run test:e2e
cd ../server && python run_pytest.py

# Check test coverage
cd apps/web && npx playwright show-report
cd ../server && pytest --cov=app tests/
```

## 📈 Performance Testing

### **Frontend Performance**
- **File Upload**: < 5s for 1MB files
- **Processing**: < 30s for 10MB files
- **Download**: < 10s for ZIP extraction

### **Backend Performance**
- **Health Check**: < 100ms response time
- **CSV Processing**: < 2s for 1MB files
- **ZIP Generation**: < 5s for 10MB files

## 🎯 Test Coverage Goals

### **Frontend Coverage**
- [ ] **100% User Workflows**: All major user paths tested
- [ ] **100% Error Scenarios**: All error states covered
- [ ] **100% Browser Support**: Chrome, Firefox, Safari
- [ ] **100% File Operations**: Upload, download, validation

### **Backend Coverage**
- [ ] **100% API Endpoints**: All endpoints tested
- [ ] **100% Bot Detection**: All classification logic tested
- [ ] **100% Error Handling**: All error scenarios covered
- [ ] **100% Data Validation**: All input validation tested

## 🚀 Next Steps

### **Immediate Actions**
1. **Install Dependencies**: Run npm install and pip install
2. **Start Services**: Frontend on 3000, backend on 8000
3. **Run Tests**: Execute both test suites
4. **Review Results**: Check for failures and fix issues

### **Future Enhancements**
- **Visual Regression Testing**: Screenshot comparison
- **Load Testing**: Performance under stress
- **Security Testing**: Vulnerability scanning
- **Accessibility Testing**: WCAG compliance

### **Maintenance**
- **Weekly Test Runs**: Automated test execution
- **Test Data Updates**: Refresh sample data
- **Dependency Updates**: Keep testing frameworks current
- **Coverage Monitoring**: Track test coverage metrics

---

**Happy Testing! 🧪✨**

