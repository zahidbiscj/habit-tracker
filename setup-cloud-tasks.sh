#!/bin/bash
# Setup Cloud Tasks Queue for Notification Scheduling
# Run this once before deploying functions

PROJECT_ID="habit-tracker-1e347"
LOCATION="us-central1"
QUEUE_NAME="notification-scheduler"

echo "🔧 Setting up Cloud Tasks queue for notifications..."
echo "Project: $PROJECT_ID"
echo "Location: $LOCATION"
echo "Queue: $QUEUE_NAME"
echo ""

# Create the queue
echo "Creating queue..."
gcloud tasks queues create $QUEUE_NAME \
  --location=$LOCATION \
  --project=$PROJECT_ID \
  --max-attempts=3 \
  --max-retry-duration=1h

if [ $? -eq 0 ]; then
  echo "✅ Queue created successfully!"
else
  echo "⚠️  Queue may already exist or there was an error."
  echo "Check existing queues with:"
  echo "  gcloud tasks queues list --location=$LOCATION --project=$PROJECT_ID"
fi

echo ""
echo "📋 To view queue details:"
echo "  gcloud tasks queues describe $QUEUE_NAME --location=$LOCATION --project=$PROJECT_ID"
