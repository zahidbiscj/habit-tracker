# Setup Cloud Tasks Queue for Notification Scheduling
# Run this once before deploying functions (Windows PowerShell)

$PROJECT_ID = "habit-tracker-1e347"
$LOCATION = "us-central1"
$QUEUE_NAME = "notification-scheduler"

Write-Host "🔧 Setting up Cloud Tasks queue for notifications..." -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID"
Write-Host "Location: $LOCATION"
Write-Host "Queue: $QUEUE_NAME"
Write-Host ""

# Create the queue
Write-Host "Creating queue..." -ForegroundColor Yellow
gcloud tasks queues create $QUEUE_NAME `
  --location=$LOCATION `
  --project=$PROJECT_ID `
  --max-attempts=3 `
  --max-retry-duration=1h

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Queue created successfully!" -ForegroundColor Green
} else {
  Write-Host "⚠️  Queue may already exist or there was an error." -ForegroundColor Yellow
  Write-Host "Check existing queues with:"
  Write-Host "  gcloud tasks queues list --location=$LOCATION --project=$PROJECT_ID" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 To view queue details:" -ForegroundColor Cyan
Write-Host "  gcloud tasks queues describe $QUEUE_NAME --location=$LOCATION --project=$PROJECT_ID" -ForegroundColor Gray
