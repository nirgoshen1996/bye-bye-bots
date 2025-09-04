# ByeByeBots.io

A modern SaaS application for bot detection and email list cleaning, built with Next.js 14 and FastAPI.

**Live at**: https://byebyebots.io

## 🚀 Features

- **Frontend**: Modern React application with Next.js 14, TypeScript, and Tailwind CSS
- **Backend**: FastAPI-based API with Python 3.11
- **Bot Detection**: Advanced scoring-based bot detection algorithm
- **Email Verification**: Comprehensive email validation with syntax and MX record checking
- **Configurable Processing**: Customizable bot detection thresholds and validation options
- **File Processing**: CSV upload, processing, and ZIP download with multiple output formats
- **Modern UI**: Responsive design with dark/light theme support
- **Testing**: Comprehensive test suite with Playwright (frontend) and pytest (backend)

## 🏗️ Architecture

```
bot-cleaner-SaaS/
├── apps/
│   ├── web/                 # Next.js 14 frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility functions
│   │   └── tests/         # Playwright E2E tests
│   └── server/             # FastAPI backend
│       ├── app/            # API endpoints and logic
│       ├── tests/          # pytest unit tests
│       └── requirements.txt # Python dependencies
├── docker-compose.yml       # Multi-service orchestration
├── package.json            # Root workspace configuration
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm 9+**
- **Python 3.11+** and **pip**
- **Docker** and **Docker Compose** (optional)

### Production Deployment

For production deployment to **byebyebots.io**, see our comprehensive [Deployment Guide](DEPLOYMENT_GUIDE.md).

**Quick Overview**:
- **Frontend**: Deploy to Vercel at `byebyebots.io`
- **Backend**: Deploy to Railway at `api.byebyebots.io`
- **Database**: Supabase for data storage
- **Payments**: Stripe for billing

### Option 1: Docker (Recommended)

```bash
# Clone and setup
git clone <repository-url>
cd bot-cleaner-SaaS

# Start all services
docker compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Local Development

```bash
# Clone and setup
git clone <repository-url>
cd bot-cleaner-SaaS

# Install dependencies
npm run install-all

# Start frontend (Terminal 1)
npm run dev:web

# Start backend (Terminal 2)
npm run dev:server

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 🔧 Development Commands

### Using npm (Root)

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:web         # Start frontend only
npm run dev:server      # Start backend only

# Building
npm run build           # Build frontend

# Testing
npm run test            # Run all tests
npm run test:web       # Run frontend tests (Playwright)
npm run test:server    # Run backend tests (pytest)

# Code Quality
npm run lint            # Lint all code
npm run format          # Format all code

# Docker
npm run docker-up       # Start services
npm run docker-down     # Stop services
npm run docker-logs     # View logs
```

### Using Make

```bash
# Development
make dev                # Start both services
make dev-web           # Start frontend only
make dev-server        # Start backend only

# Testing
make test              # Run all tests
make test-web          # Run frontend tests
make test-server       # Run backend tests

# Code Quality
make lint              # Lint all code
make format            # Format all code
```

## 📱 Frontend (Next.js 14)

### Features

- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Theme Support**: Light/dark mode with system preference detection
- **Responsive Design**: Mobile-first approach with consistent spacing
- **File Upload**: Drag-and-drop CSV upload with preview
- **Column Mapping**: Intelligent auto-detection with manual override
- **Progress Tracking**: Real-time processing status and progress bars
- **Results Display**: Comprehensive statistics and download options

### Pages

- **`/`**: Landing page with feature overview and CTA
- **`/upload`**: CSV file upload with drag-and-drop and preview
- **`/map`**: Column mapping with auto-detection
- **`/results`**: Processing results with statistics and downloads

### Components

- **UI Components**: Button, Card, Input, Label, Select, Progress, Alert, Tooltip
- **Layout**: Container, ThemeToggle, CSV preview tables
- **Forms**: File upload, column mapping, validation

## 🔌 Backend (FastAPI)

### Features

- **RESTful API**: Clean, documented endpoints
- **Bot Detection**: Advanced scoring-based algorithm
- **Email Verification**: Syntax validation and MX record checking
- **Configurable Processing**: Customizable thresholds and validation options
- **File Processing**: Memory-safe CSV handling with multiple encodings
- **ZIP Generation**: Streaming responses with multiple output formats

### API Endpoints

- **`GET /`**: API information and available endpoints
- **`GET /health`**: Health check endpoint
- **`POST /process`**: CSV processing with bot detection

### Bot Detection

The system uses a sophisticated scoring approach for bot detection:

- **Disposable Domains**: Curated list of temporary email services
- **Local-part Analysis**: Detection of obvious bot indicators
- **Randomness Detection**: Analysis of character patterns and ratios
- **Role Account Detection**: Identification of system/role emails
- **Name Heuristics**: Context from first/last names when available

### Email Verification

New comprehensive email validation features:

- **Syntax Validation**: RFC-compliant email format checking
- **MX Record Checking**: DNS lookup for mail exchange records
- **Status Classification**: `valid`, `invalid_syntax`, `no_mx`, `unknown`
- **Configurable Options**: Enable/disable validation steps
- **Performance Tuning**: Timeout and threshold configuration

### Processing Options

Configurable parameters for customization:

```bash
# Example with custom options
curl -X POST "http://localhost:8000/process" \
  -F "file=@data.csv" \
  -F "mapping={\"email\":\"email\"}" \
  -G \
  -d "enable_mx_check=false" \
  -d "treat_invalid_as_bots=false" \
  -d "bot_threshold=0.5"
```

## 🧪 Testing

### Frontend Testing (Playwright)

```bash
cd apps/web

# Run all tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

**Test Coverage:**
- Complete CSV processing workflow
- File upload and validation
- Column mapping and auto-detection
- Processing progress and results
- Download functionality
- Error handling and edge cases

### Backend Testing (pytest)

```bash
cd apps/server

# Run all tests
python run_pytest.py

# Direct pytest
pytest tests/ -v

# Specific test
pytest tests/test_api.py::TestProcessEndpoint -v
```

**Test Coverage:**
- API endpoint functionality
- Bot detection algorithms
- Email verification features
- CSV processing pipeline
- Error handling and validation
- Configurable options

## 📊 Output Files

The system generates three CSV files and a summary:

### 1. `clean.csv`
- Non-bot rows plus rows without email addresses
- Original columns preserved
- `BOT` and `EMAIL_STATUS` columns added

### 2. `bots.csv`
- Rows classified as bots
- Original columns preserved
- `BOT` and `EMAIL_STATUS` columns added

### 3. `annotated.csv`
- All rows with classification results
- Original columns preserved
- `BOT` and `EMAIL_STATUS` columns added

### 4. `summary.json`
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

## 🔧 Configuration

### Environment Variables

```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
ENABLE_MX_CHECK=true
MX_CHECK_TIMEOUT=5.0
BOT_THRESHOLD=1.0
TREAT_INVALID_AS_BOTS=true
```

### Processing Options

| Option | Default | Description |
|--------|---------|-------------|
| `enable_syntax_check` | `true` | Enable email syntax validation |
| `enable_mx_check` | `true` | Enable MX record checking |
| `treat_invalid_as_bots` | `true` | Treat invalid emails as bots |
| `mx_check_timeout` | `5.0` | MX check timeout in seconds |
| `bot_threshold` | `1.0` | Bot detection threshold |

## 🚀 Deployment

### Production Considerations

- **Frontend**: Build and serve static files
- **Backend**: Use production ASGI server (Gunicorn + Uvicorn)
- **Database**: Consider adding persistent storage for large datasets
- **Caching**: Implement DNS caching for MX record lookups
- **Monitoring**: Add health checks and metrics collection

### Docker Production

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Deploy
docker compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Add** tests for new functionality
5. **Ensure** all tests pass
6. **Submit** a pull request

### Development Guidelines

- Follow existing code style and patterns
- Add comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Test both frontend and backend changes

## 📚 Documentation

- **Main README**: This file
- **API Documentation**: Available at `/docs` when backend is running
- **Email Verification**: See `apps/server/EMAIL_VERIFICATION_README.md`
- **Testing Guide**: See `TESTING.md`
- **Frontend Components**: See `apps/web/README.md`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Create an issue in the repository
- **Documentation**: Check the docs and README files
- **Testing**: Run the test suites to verify functionality
- **Demo**: Use the demo scripts to see features in action

---

**Happy Bot Cleaning! 🧹✨**
