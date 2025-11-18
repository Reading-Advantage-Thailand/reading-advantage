# AI Insights Auto-Refresh with Cloud Scheduler

This document describes how to set up automated daily refresh of AI insights using Google Cloud Scheduler.

## Overview

The AI insights refresh system automatically generates fresh insights for all active entities daily:
- **System**: Overall platform metrics
- **Licenses**: School-level insights  
- **Classrooms**: Class performance insights
- **Teachers**: Teaching effectiveness insights
- **Students**: Individual learning insights (active students only)

## API Endpoint

**URL**: `https://your-domain.com/api/v1/ai/insights/refresh`

**Method**: `POST`

**Authentication**: Access Key (via `x-access-key` header)

**Response**:
```json
{
  "message": "AI insights refresh completed (automated)",
  "summary": {
    "total": 1250,
    "success": 1245,
    "failed": 5,
    "skipped": 0,
    "totalInsights": 6225,
    "duration": "125000ms"
  },
  "byScope": {
    "system": 1,
    "license": 50,
    "classroom": 200,
    "teacher": 100,
    "student": 900
  },
  "refreshedAt": "2025-11-18T10:00:00.000Z",
  "refreshedBy": "Cloud Scheduler"
}
```

## Cloud Scheduler Setup

### 1. Create Scheduler Job (Console)

1. Go to **Cloud Scheduler** in Google Cloud Console
2. Click **Create Job**
3. Configure:
   - **Name**: `ai-insights-daily-refresh`
   - **Region**: Choose your app region
   - **Description**: Daily refresh of AI insights cache
   - **Frequency**: `0 2 * * *` (2 AM daily)
   - **Timezone**: Your timezone
   - **Target**: HTTP
   - **URL**: `https://your-domain.com/api/v1/ai/insights/refresh`
   - **HTTP Method**: POST
   - **Headers**:
     - Key: `x-access-key`
     - Value: Your access key from `.env`
   - **Retry Configuration**:
     - Max retry attempts: 3
     - Max retry duration: 1 hour
     - Min/Max backoff: 5s / 60s

### 2. Create Scheduler Job (gcloud CLI)

```bash
gcloud scheduler jobs create http ai-insights-daily-refresh \
  --schedule="0 2 * * *" \
  --uri="https://your-domain.com/api/v1/ai/insights/refresh" \
  --http-method=POST \
  --headers="x-access-key=YOUR_ACCESS_KEY_HERE" \
  --time-zone="Asia/Bangkok" \
  --location="asia-southeast1" \
  --max-retry-attempts=3 \
  --max-retry-duration=3600s \
  --min-backoff=5s \
  --max-backoff=60s \
  --description="Daily refresh of AI insights cache for all entities"
```

### 3. Test the Job

```bash
# Trigger manually to test
gcloud scheduler jobs run ai-insights-daily-refresh --location="asia-southeast1"

# Check logs
gcloud scheduler jobs describe ai-insights-daily-refresh --location="asia-southeast1"
```

## Monitoring

### Health Check Endpoint

**URL**: `GET /api/v1/ai/insights/refresh`

Returns status of recent refreshes and cache:

```json
{
  "status": "healthy",
  "last24Hours": [
    { "scope": "STUDENT", "count": 900 },
    { "scope": "TEACHER", "count": 100 },
    { "scope": "CLASSROOM", "count": 200 },
    { "scope": "LICENSE", "count": 50 },
    { "scope": "SYSTEM", "count": 1 }
  ],
  "cacheStatus": [
    { "scope": "STUDENT", "cached": 900 },
    { "scope": "TEACHER", "cached": 100 },
    { "scope": "CLASSROOM", "cached": 200 },
    { "scope": "LICENSE", "cached": 50 },
    { "scope": "SYSTEM", "cached": 1 }
  ],
  "timestamp": "2025-11-18T10:00:00.000Z"
}
```

### Application Logs

Check server logs for refresh activity:

```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND jsonPayload.message=~'CLOUD_SCHEDULER.*AI'" --limit=50 --format=json

# Filter for errors
gcloud logging read "resource.type=cloud_run_revision AND jsonPayload.message=~'CLOUD_SCHEDULER.*AI.*failed'" --limit=20
```

Key log markers:
- `[CLOUD_SCHEDULER] Starting automated AI insights refresh` - Start of job
- `[CLOUD_SCHEDULER] Refreshing {SCOPE} insights` - Each scope being processed
- `[CLOUD_SCHEDULER] AI Insights refresh completed` - Success summary
- `[CLOUD_SCHEDULER] Failed refreshes` - Failure details

## Performance Optimization

### Active Entity Filtering

To prevent timeouts and reduce costs, the system only refreshes:

- **Students**: Active in last 7 days (limit 1000)
- **Teachers**: Have active classrooms (updated in last 30 days)
- **Classrooms**: Not archived, updated in last 30 days
- **Licenses**: Not expired
- **System**: Always refreshed (once)

### Parallel Processing

- Licenses, classrooms, teachers, and students are processed in parallel
- Each scope uses `Promise.allSettled` to continue on individual failures
- System insights generated first as they're fastest

### Expected Duration

- Small school (100 students): ~2-3 minutes
- Medium school (500 students): ~8-10 minutes  
- Large deployment (1000+ students): ~15-20 minutes

**Note**: First run will be slower as it generates all insights. Subsequent runs benefit from unchanged entities.

## Cache Strategy

- **TTL**: 7 days
- **Storage**: PostgreSQL `ai_insight_cache` table
- **Key Format**: `{scope}:{entityId}` (e.g., `student:user123`, `license:lic456`)
- **Cleanup**: Old cache entries automatically deleted before new ones created

## Cost Considerations

### OpenAI API Usage

Estimated tokens per insight generation:
- Student: ~1,500 tokens
- Teacher: ~1,800 tokens
- Classroom: ~2,000 tokens
- License: ~2,000 tokens
- System: ~2,500 tokens

**Daily cost estimate** (1000 active students):
- Students: 1000 × 1500 tokens = 1.5M tokens
- Teachers: 100 × 1800 tokens = 180k tokens
- Classrooms: 200 × 2000 tokens = 400k tokens
- Licenses: 50 × 2000 tokens = 100k tokens
- System: 1 × 2500 tokens = 2.5k tokens

**Total**: ~2.18M tokens/day × $0.15/1M tokens = **$0.33/day** (~$10/month)

### Optimization Tips

1. **Adjust active student filter** - Currently last 7 days, can increase to 14 or 30 days
2. **Reduce student limit** - Currently 1000, can lower if needed
3. **Skip unchanged entities** - Future: check if metrics changed before regenerating
4. **Batch by priority** - Generate high-value insights first (teachers, classrooms)

## Troubleshooting

### Job Fails to Complete

**Symptoms**: Timeout or partial completion

**Solutions**:
- Reduce `take` limit for students (line 453 in controller)
- Increase Cloud Scheduler timeout
- Split into multiple jobs (students separate from others)

### High OpenAI Costs

**Symptoms**: Unexpected API charges

**Solutions**:
- Check active student filter is working
- Review prompt token usage in logs
- Consider reducing insight count per entity
- Implement rate limiting

### Stale Insights

**Symptoms**: Users see old insights

**Solutions**:
- Check scheduler is running: `gcloud scheduler jobs list`
- Verify access key is correct
- Check application logs for errors
- Manually trigger: `gcloud scheduler jobs run ai-insights-daily-refresh`

### Failed Entity Refreshes

**Symptoms**: Some entities show errors in response

**Solutions**:
- Check individual error messages in logs
- Common causes:
  - Missing data (user deleted, classroom archived)
  - OpenAI API errors (rate limit, timeout)
  - Database connection issues
- Retry will happen automatically on next run

## Manual Trigger

To manually refresh all insights:

```bash
# Using curl
curl -X POST https://your-domain.com/api/v1/ai/insights/refresh \
  -H "x-access-key: YOUR_ACCESS_KEY"

# Using gcloud
gcloud scheduler jobs run ai-insights-daily-refresh --location="asia-southeast1"
```

## Alerts Setup (Optional)

Create alerting for failed jobs:

```bash
# Create alert policy for failed scheduler jobs
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="AI Insights Refresh Failures" \
  --condition-display-name="Failed AI refresh" \
  --condition-threshold-value=1 \
  --condition-threshold-duration=300s \
  --condition-filter='resource.type="cloud_scheduler_job" AND metric.type="cloudscheduler.googleapis.com/job/attempt_count" AND metric.label.status="failed"'
```

## Next Steps

1. ✅ Create Cloud Scheduler job
2. ✅ Set up monitoring dashboard
3. ✅ Configure alerting
4. 🔄 Monitor first few runs
5. 🔄 Adjust timing/filters based on usage
6. 🔄 Implement cost tracking
