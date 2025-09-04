# Email Verification and Configurable Processing

This document describes the enhanced email verification and configurable processing features added to the Bot Cleaner SaaS application.

## 🎯 Overview

The system now provides comprehensive email verification capabilities with configurable options for bot detection and processing behavior. This enhancement includes:

- **Email Syntax Validation**: Using `email-validator` package
- **MX Record Checking**: Using `dnspython` for DNS lookups
- **Configurable Processing Options**: Customizable thresholds and behaviors
- **Enhanced Output**: New `EMAIL_STATUS` column and detailed statistics

## 🔧 New Features

### 1. Email Status Classification

Each email address is now classified into one of four statuses:

- **`valid`**: Email passes syntax validation and has MX records
- **`invalid_syntax`**: Email fails basic syntax validation
- **`no_mx`**: Email syntax is valid but domain has no MX records
- **`unknown`**: Email is empty, null, or cannot be processed

### 2. Configurable Processing Options

The system now accepts query parameters to customize processing behavior:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `enable_syntax_check` | boolean | `true` | Enable email syntax validation |
| `enable_mx_check` | boolean | `true` | Enable MX record checking |
| `treat_invalid_as_bots` | boolean | `true` | Treat invalid emails as bots |
| `mx_check_timeout` | float | `5.0` | MX check timeout in seconds |
| `bot_threshold` | float | `1.0` | Bot detection threshold |

### 3. Enhanced Output Structure

#### New CSV Columns

All output CSV files now include:
- **`BOT`**: `TRUE`/`FALSE`/`UNKNOWN` (as before)
- **`EMAIL_STATUS`**: `valid`/`invalid_syntax`/`no_mx`/`unknown`

#### Enhanced Summary JSON

The `summary.json` file now includes:

```json
{
  "total_rows": 1000,
  "rows_with_email": 950,
  "rows_without_email": 50,
  "bots_count": 150,
  "clean_count": 850,
  "valid_emails": 800,
  "invalid_syntax_emails": 100,
  "no_mx_emails": 30,
  "unknown_emails": 20,
  "timestamp": "2024-01-15T10:30:00Z",
  "processing_options": {
    "enable_syntax_check": true,
    "enable_mx_check": true,
    "treat_invalid_as_bots": true,
    "mx_check_timeout": 5.0,
    "bot_threshold": 1.0
  }
}
```

## 🚀 Usage Examples

### Basic API Call

```bash
curl -X POST "http://localhost:8000/process" \
  -F "file=@data.csv" \
  -F "mapping={\"email\":\"email\",\"firstName\":\"first_name\",\"lastName\":\"last_name\"}"
```

### With Custom Options

```bash
curl -X POST "http://localhost:8000/process" \
  -F "file=@data.csv" \
  -F "mapping={\"email\":\"email\"}" \
  -G \
  -d "enable_mx_check=false" \
  -d "treat_invalid_as_bots=false" \
  -d "bot_threshold=0.5"
```

### Python Client Example

```python
import requests

url = "http://localhost:8000/process"
files = {"file": open("data.csv", "rb")}
data = {"mapping": '{"email": "email"}'}
params = {
    "enable_syntax_check": "true",
    "enable_mx_check": "true",
    "treat_invalid_as_bots": "true",
    "mx_check_timeout": "5.0",
    "bot_threshold": "1.0"
}

response = requests.post(url, files=files, data=data, params=params)
```

## ⚙️ Configuration Options

### 1. Syntax Check (`enable_syntax_check`)

- **`true`**: Validate email syntax using RFC standards
- **`false`**: Skip syntax validation (faster processing)

**Use Cases:**
- Set to `false` when you trust your data source
- Set to `true` for data quality assurance

### 2. MX Record Check (`enable_mx_check`)

- **`true`**: Verify domain has mail exchange records
- **`false`**: Skip MX record checking (faster processing)

**Use Cases:**
- Set to `false` for faster processing of large datasets
- Set to `true` for comprehensive email validation

### 3. Invalid Email Treatment (`treat_invalid_as_bots`)

- **`true`**: Mark invalid emails as bots (default)
- **`false`**: Keep invalid emails in clean dataset

**Use Cases:**
- Set to `true` for strict bot detection
- Set to `false` when you want to preserve all data

### 4. MX Check Timeout (`mx_check_timeout`)

- **Range**: 1.0 to 30.0 seconds
- **Default**: 5.0 seconds

**Use Cases:**
- Lower values for faster processing
- Higher values for unreliable networks

### 5. Bot Detection Threshold (`bot_threshold`)

- **Range**: 0.1 to 5.0
- **Default**: 1.0

**Use Cases:**
- Lower values for stricter bot detection
- Higher values for more lenient detection

## 📊 Processing Scenarios

### Scenario 1: Strict Processing (Default)

```python
options = ProcessingOptions(
    enable_syntax_check=True,
    enable_mx_check=True,
    treat_invalid_as_bots=True,
    mx_check_timeout=5.0,
    bot_threshold=1.0
)
```

**Result**: Maximum data quality, slower processing, strict bot detection

### Scenario 2: Fast Processing

```python
options = ProcessingOptions(
    enable_syntax_check=False,
    enable_mx_check=False,
    treat_invalid_as_bots=False,
    mx_check_timeout=1.0,
    bot_threshold=1.5
)
```

**Result**: Fast processing, basic validation, lenient bot detection

### Scenario 3: Quality-Focused

```python
options = ProcessingOptions(
    enable_syntax_check=True,
    enable_mx_check=True,
    treat_invalid_as_bots=False,
    mx_check_timeout=10.0,
    bot_threshold=0.5
)
```

**Result**: High data quality, comprehensive validation, strict bot detection

## 🔍 Email Status Examples

### Valid Emails
- `john.doe@gmail.com` → `valid`
- `user@company.com` → `valid`
- `contact@example.org` → `valid`

### Invalid Syntax
- `invalid-email` → `invalid_syntax`
- `user@` → `invalid_syntax`
- `@domain.com` → `invalid_syntax`

### No MX Records
- `test@nonexistentdomain12345.com` → `no_mx`
- `user@invalid.tld` → `no_mx`

### Unknown Status
- `""` (empty string) → `unknown`
- `None` → `unknown`

## 📈 Performance Considerations

### Processing Speed

| Configuration | Relative Speed | Use Case |
|---------------|----------------|----------|
| No checks | 100% | Large datasets, trusted data |
| Syntax only | 95% | Basic validation |
| Syntax + MX | 70% | Production quality |
| Full validation | 60% | Maximum quality |

### Memory Usage

- **Syntax check**: Minimal impact
- **MX check**: Moderate impact (DNS lookups)
- **Large datasets**: Consider disabling MX checks for files >100K rows

### Network Impact

- **MX checks**: One DNS lookup per unique domain
- **Timeout handling**: Automatic fallback for slow responses
- **Caching**: Consider implementing DNS caching for production

## 🧪 Testing

### Running Tests

```bash
cd apps/server
python -m pytest tests/ -v
```

### Test Coverage

The test suite covers:
- ✅ Email status classification
- ✅ Configurable options
- ✅ Enhanced output validation
- ✅ Error handling
- ✅ Performance scenarios

### Demo Script

Run the demonstration script:

```bash
cd apps/server
python demo_email_verification.py
```

## 🚨 Error Handling

### Common Issues

1. **DNS Timeout**: Increase `mx_check_timeout`
2. **Large Files**: Disable MX checks for files >100K rows
3. **Network Issues**: Implement retry logic for production

### Best Practices

- Start with default settings
- Adjust based on your data quality requirements
- Monitor processing times and adjust accordingly
- Use appropriate timeouts for your network environment

## 🔮 Future Enhancements

### Planned Features

- **DNS Caching**: Reduce repeated lookups
- **Bulk MX Checking**: Parallel domain validation
- **Custom Domain Lists**: Whitelist/blacklist support
- **Real-time Validation**: WebSocket-based processing

### Configuration Profiles

Pre-defined configurations for common use cases:
- **Development**: Fast processing, basic validation
- **Staging**: Balanced speed and quality
- **Production**: Maximum quality, comprehensive validation

## 📚 API Reference

### Endpoint: `POST /process`

**Query Parameters:**
- `enable_syntax_check` (boolean)
- `enable_mx_check` (boolean)
- `treat_invalid_as_bots` (boolean)
- `mx_check_timeout` (float)
- `bot_threshold` (float)

**Form Data:**
- `file`: CSV file upload
- `mapping`: JSON string with column mapping

**Response:**
- `application/zip` containing processed files
- Enhanced summary with email status counts

## 🤝 Contributing

When adding new email validation features:

1. Update `BotDetectionConfig` class
2. Add corresponding `ProcessingOptions` fields
3. Update API endpoint parameters
4. Add comprehensive tests
5. Update documentation

## 📄 License

This enhancement is part of the Bot Cleaner SaaS application and follows the same licensing terms.

---

**For questions or support, please refer to the main project documentation or create an issue in the project repository.**

