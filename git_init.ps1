# Git initialization script
Write-Host "Initializing Git repository..." -ForegroundColor Green

try {
    # Initialize Git repository
    git init
    Write-Host "Git repository initialized successfully!" -ForegroundColor Green
    
    # Add all files
    git add .
    Write-Host "Files added to staging area!" -ForegroundColor Green
    
    # Make initial commit
    git commit -m "initial commit"
    Write-Host "Initial commit created successfully!" -ForegroundColor Green
    
    Write-Host "Git setup complete!" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Make sure Git is installed and available in your PATH." -ForegroundColor Yellow
}
