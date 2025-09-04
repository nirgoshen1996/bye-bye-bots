import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CSV Processing Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test('should complete full CSV processing workflow', async ({ page }) => {
    // Step 1: Navigate to upload page
    await page.getByRole('button', { name: 'Start Cleaning' }).click();
    await expect(page).toHaveURL('/upload');

    // Step 2: Upload CSV file
    const fileInput = page.locator('input[type="file"]');
    const testCsvPath = path.join(__dirname, '../test-data/sample.csv');
    
    // Create test CSV file if it doesn't exist
    await createTestCSV(testCsvPath);
    
    await fileInput.setInputFiles(testCsvPath);
    
    // Wait for file to be processed and preview to appear
    await expect(page.getByText('Preview (first 10 rows)')).toBeVisible();
    await expect(page.getByText('john.doe@gmail.com')).toBeVisible();
    await expect(page.getByText('bot@mailinator.com')).toBeVisible();
    
    // Step 3: Proceed to mapping
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL('/map');
    
    // Step 4: Verify auto-detection and mapping
    await expect(page.getByText('Column Mapping')).toBeVisible();
    
    // Check that email column is auto-detected and required
    const emailSelect = page.locator('select').first();
    await expect(emailSelect).toHaveValue('email');
    
    // Step 5: Continue to results (processing will start automatically)
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/\/results/);
    
    // Step 6: Wait for processing to complete
    await expect(page.getByText('Processing Complete!')).toBeVisible({ timeout: 30000 });
    
    // Step 7: Verify statistics are displayed
    await expect(page.getByText('Total Rows')).toBeVisible();
    await expect(page.getByText('5')).toBeVisible(); // Total rows
    await expect(page.getByText('Bots Found')).toBeVisible();
    await expect(page.getByText('3')).toBeVisible(); // Bots found
    await expect(page.getByText('Clean Rows')).toBeVisible();
    await expect(page.getByText('2')).toBeVisible(); // Clean rows
    
    // Step 8: Download and validate annotated CSV
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Annotated' }).click();
    const download = await downloadPromise;
    
    // Save the file and read its contents
    const filePath = await download.saveAs();
    const fileContent = await readFileContent(filePath);
    
    // Validate that the file contains the BOT column with expected values
    expect(fileContent).toContain('BOT');
    expect(fileContent).toContain('TRUE'); // Bot rows
    expect(fileContent).toContain('FALSE'); // Clean rows
    expect(fileContent).toContain('UNKNOWN'); // Rows without email (if any)
    
    // Verify specific bot detection results
    expect(fileContent).toContain('bot@mailinator.com,TRUE'); // Disposable domain
    expect(fileContent).toContain('test@company.com,TRUE'); // Test local-part
    expect(fileContent).toContain('admin@company.com,TRUE'); // Role account
    expect(fileContent).toContain('john.doe@gmail.com,FALSE'); // Human email
    expect(fileContent).toContain('jane.smith@company.com,FALSE'); // Human email
  });

  test('should handle missing email column gracefully', async ({ page }) => {
    // Navigate to upload page
    await page.getByRole('button', { name: 'Start Cleaning' }).click();
    
    // Upload CSV without email column
    const fileInput = page.locator('input[type="file"]');
    const invalidCsvPath = path.join(__dirname, '../test-data/invalid-no-email.csv');
    
    await createInvalidCSV(invalidCsvPath);
    await fileInput.setInputFiles(invalidCsvPath);
    
    // Try to proceed to mapping
    await page.getByRole('button', { name: 'Next' }).click();
    
    // Should stay on upload page or show error
    await expect(page).toHaveURL('/upload');
  });

  test('should show progress indicators during processing', async ({ page }) => {
    // Navigate through upload and mapping
    await page.getByRole('button', { name: 'Start Cleaning' }).click();
    
    const fileInput = page.locator('input[type="file"]');
    const testCsvPath = path.join(__dirname, '../test-data/sample.csv');
    await createTestCSV(testCsvPath);
    await fileInput.setInputFiles(testCsvPath);
    
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify progress indicators are shown
    await expect(page.getByText('Uploading CSV File')).toBeVisible();
    await expect(page.locator('.progress')).toBeVisible();
    
    // Wait for processing to start
    await expect(page.getByText('Processing Data')).toBeVisible({ timeout: 10000 });
    
    // Verify progress bar updates
    const progressBar = page.locator('.progress');
    await expect(progressBar).toBeVisible();
  });

  test('should handle processing errors gracefully', async ({ page }) => {
    // This test would require mocking the API to return an error
    // For now, we'll test the error UI components exist
    
    // Navigate to results page directly with invalid data
    await page.goto('/results?mapping=invalid');
    
    // Should show error state
    await expect(page.getByText('Processing Failed')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible();
  });

  test('should download all three file types correctly', async ({ page }) => {
    // Complete the workflow to get to download stage
    await page.getByRole('button', { name: 'Start Cleaning' }).click();
    
    const fileInput = page.locator('input[type="file"]');
    const testCsvPath = path.join(__dirname, '../test-data/sample.csv');
    await createTestCSV(testCsvPath);
    await fileInput.setInputFiles(testCsvPath);
    
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Wait for processing to complete
    await expect(page.getByText('Processing Complete!')).toBeVisible({ timeout: 30000 });
    
    // Test all three download buttons
    const downloadButtons = [
      { name: 'Download Clean', expectedFile: 'clean.csv' },
      { name: 'Download Bots', expectedFile: 'bots.csv' },
      { name: 'Download Annotated', expectedFile: 'annotated.csv' }
    ];
    
    for (const button of downloadButtons) {
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: button.name }).click();
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe(button.expectedFile);
    }
  });
});

// Helper functions
async function createTestCSV(filePath: string): Promise<void> {
  const fs = require('fs');
  const csvContent = `email,first_name,last_name,company
john.doe@gmail.com,John,Doe,Company A
jane.smith@company.com,Jane,Smith,Company B
bot@mailinator.com,Bot,User,Company C
test@company.com,Test,User,Company D
admin@company.com,Admin,User,Company E`;
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, csvContent);
}

async function createInvalidCSV(filePath: string): Promise<void> {
  const fs = require('fs');
  const csvContent = `first_name,last_name,company
John,Doe,Company A
Jane,Smith,Company B`;
  
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, csvContent);
}

async function readFileContent(filePath: string): Promise<string> {
  const fs = require('fs');
  return fs.readFileSync(filePath, 'utf-8');
}

