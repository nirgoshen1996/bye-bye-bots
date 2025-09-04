# Testing the /results Page

## Overview

The `/results` page is a new addition that handles the complete CSV processing workflow. It automatically processes uploaded CSV files and provides download functionality for the results.

## Test Flow

### 1. **Upload CSV File** (`/upload`)
- Upload a CSV file with email addresses
- Verify the file is parsed and preview is shown
- Click "Next" to proceed to mapping

### 2. **Map Columns** (`/map`)
- Verify auto-detection of email, first name, and last name columns
- Confirm email column is required (validation works)
- Click "Continue" to proceed to results

### 3. **Results Page** (`/results`)
- **Automatic Processing**: The page should automatically start processing the CSV
- **Progress Indicators**: 
  - Uploading phase (10% progress)
  - Processing phase (30-80% progress)
  - Completion (100% progress)

### 4. **Success State**
- **Statistics Cards**: Display total rows, with email, bots found, clean rows
- **Processing Summary**: Show additional stats like bot detection rate
- **Download Buttons**: Three buttons for different file types

### 5. **Download Functionality**
- **Download Clean**: Extracts `clean.csv` from ZIP and downloads it
- **Download Bots**: Extracts `bots.csv` from ZIP and downloads it  
- **Download Annotated**: Extracts `annotated.csv` from ZIP and downloads it

## Test Scenarios

### **Happy Path**
1. Upload valid CSV with email column
2. Map columns correctly
3. Verify processing completes successfully
4. Test all download buttons
5. Verify downloaded files contain correct data

### **Error Handling**
1. **Network Issues**: Test with slow network or disconnection
2. **Invalid Mapping**: Try with missing email column
3. **Large Files**: Test with files >10MB to verify memory handling
4. **Invalid CSV**: Test with malformed CSV data

### **Browser Compatibility**
- **Chrome**: Test download functionality
- **Firefox**: Test download functionality  
- **Edge**: Test download functionality
- **Safari**: Test download functionality (if available)

## Expected Behavior

### **Progress States**
- **Idle**: "Preparing to process..." with spinner
- **Uploading**: "Uploading CSV File" with progress bar (10%)
- **Processing**: "Processing Data" with progress bar (30-80%)
- **Success**: Results display with download options
- **Error**: Error message with "Try Again" button

### **Download Features**
- **Client-side ZIP Extraction**: Uses JSZip to extract files from ZIP blob
- **Proper Filenames**: Downloads with correct file extensions
- **CSV Content**: Files contain UTF-8 BOM for Excel compatibility
- **Error Handling**: Graceful fallback if ZIP extraction fails

### **UI Elements**
- **Statistics Cards**: 4 cards showing key metrics
- **Progress Bar**: Visual progress indicator during processing
- **Download Buttons**: Large, descriptive buttons with file counts
- **Action Buttons**: "Process Another File" and "Back to Home"

## Technical Implementation

### **State Management**
- Uses React state for processing status
- Tracks progress percentage
- Stores ZIP blob for client-side extraction
- Manages error states and success data

### **API Integration**
- Calls `/api/process` endpoint
- Handles multipart form data
- Processes ZIP file response
- Extracts summary.json for statistics

### **File Handling**
- **JSZip Library**: Client-side ZIP extraction
- **Blob API**: Browser-native file handling
- **Download Links**: Programmatic file downloads
- **Memory Management**: Efficient blob handling

## Performance Considerations

### **Memory Usage**
- ZIP blob stored in state (temporary)
- Files extracted on-demand
- Proper cleanup after downloads
- No unnecessary memory accumulation

### **Network Efficiency**
- Single API call for processing
- Streaming response handling
- Progress tracking for user feedback
- Graceful timeout handling

## Error Scenarios

### **Common Errors**
1. **File Upload Failed**: Network error, file too large
2. **Processing Failed**: Invalid CSV, server error
3. **Download Failed**: ZIP corruption, browser limitation
4. **Mapping Invalid**: Missing required columns

### **Recovery Actions**
- **Try Again**: Returns to upload page
- **Back Navigation**: Returns to previous step
- **Error Messages**: Clear explanation of issues
- **Fallback Data**: Graceful degradation when possible

## Testing Checklist

- [ ] **Upload Flow**: CSV uploads and parses correctly
- [ ] **Mapping Flow**: Column detection and validation works
- [ ] **Processing Flow**: API call and progress tracking
- [ ] **Success Display**: Statistics and download options appear
- [ ] **Download Clean**: clean.csv downloads correctly
- [ ] **Download Bots**: bots.csv downloads correctly
- [ ] **Download Annotated**: annotated.csv downloads correctly
- [ ] **Error Handling**: Various error scenarios handled gracefully
- [ ] **Browser Compatibility**: Works across major browsers
- [ ] **Memory Management**: No memory leaks during processing
- [ ] **Network Resilience**: Handles slow/unstable connections

## Dependencies

### **Required Packages**
- `jszip`: ZIP file extraction
- `lucide-react`: Icons for UI elements
- `@radix-ui/*`: UI components

### **Browser APIs**
- `Blob`: File handling
- `URL.createObjectURL`: Download links
- `FormData`: API request formatting
- `fetch`: HTTP requests

## Future Enhancements

### **Planned Features**
- **Progress Persistence**: Save progress across page reloads
- **Batch Processing**: Handle multiple files
- **Real-time Updates**: WebSocket progress updates
- **Download History**: Track previous downloads
- **Export Formats**: Additional file format options

