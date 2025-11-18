# Migration Guide - AI Insights Feature

## Step-by-Step Migration Instructions

### Step 1: Database Migration

1. **Review the Prisma schema changes**
   - Open `prisma/schema.prisma`
   - Review the new `AIInsight` and `AIInsightCache` models
   - Review the new enums: `AIInsightType`, `AIInsightScope`, `AIInsightPriority`

2. **Create migration**
   ```bash
   npx prisma migrate dev --name add-ai-insights-feature
   ```

3. **Verify migration**
   ```bash
   # Check if migration was created successfully
   ls prisma/migrations
   
   # Expected: You should see a new folder with timestamp and name "add-ai-insights-feature"
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Step 2: Environment Variables

1. **Verify OpenAI API Key**
   - Check your `.env` or `.env.local` file
   - Ensure `OPENAI_API_KEY` is set:
   ```env
   OPENAI_API_KEY=sk-...your-key-here...
   ```

2. **For Production/Cloud Build**
   - Add the key to your cloud environment variables
   - Update `cloudbuild.yaml` if needed (already configured)

### Step 3: Test the Implementation

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Student Dashboard**
   - Navigate to `/student/dashboard` or `/student/reports`
   - Look for AI Insights card
   - Should automatically generate insights (may take 5-10 seconds first time)

3. **Test Teacher Dashboard**
   - Navigate to `/teacher/dashboard`
   - Look for AI Teacher Brief section
   - Should show insights about classes and students

4. **Test Admin Dashboard**
   - Navigate to `/admin/dashboard`
   - Look for AI Insights in the dashboard
   - Should show license-level insights

### Step 4: Verify API Endpoints

Test each endpoint using curl or Postman:

```bash
# 1. Get AI Summary (Student)
curl -X GET 'http://localhost:3000/api/v1/ai/summary?kind=student' \
  -H 'Cookie: your-session-cookie'

# 2. Get AI Summary (Teacher)
curl -X GET 'http://localhost:3000/api/v1/ai/summary?kind=teacher' \
  -H 'Cookie: your-session-cookie'

# 3. Dismiss an insight
curl -X POST 'http://localhost:3000/api/v1/ai/insights/dismiss' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: your-session-cookie' \
  -d '{"insightId": "your-insight-id"}'

# 4. Mark action taken
curl -X POST 'http://localhost:3000/api/v1/ai/insights/action' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: your-session-cookie' \
  -d '{"insightId": "your-insight-id"}'

# 5. Force refresh insights
curl -X GET 'http://localhost:3000/api/v1/ai/summary?kind=student&refresh=true' \
  -H 'Cookie: your-session-cookie'
```

### Step 5: Check Logs

Monitor the console and server logs for:

```
[API] /api/ai/summary - XXXms - X insights (STUDENT)
```

### Step 6: Production Deployment

1. **Run production migration**
   ```bash
   # On your production server
   npx prisma migrate deploy
   ```

2. **Restart your application**

3. **Monitor initial performance**
   - Check OpenAI API usage in OpenAI dashboard
   - Monitor response times
   - Check for any errors in logs

## Rollback Plan

If you need to rollback:

### Database Rollback

```bash
# List migrations
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back add-ai-insights-feature

# Optional: Delete the migration file
rm -rf prisma/migrations/YYYYMMDDHHMMSS_add-ai-insights-feature
```

### Code Rollback

```bash
# Revert the commits
git revert HEAD~5..HEAD  # Adjust number based on commits

# Or checkout previous version
git checkout <previous-commit-hash>
```

## Common Issues and Solutions

### Issue 1: "OpenAI API Key not found"
**Solution:**
- Verify `.env` file has `OPENAI_API_KEY`
- Restart development server
- Check environment variables are loaded

### Issue 2: "No insights generated"
**Possible Causes:**
- User doesn't have enough activity data (need at least 3-5 activities)
- OpenAI API quota exceeded
- Network issues

**Solution:**
- Check server logs for specific error
- Verify user has activity records in database
- Check OpenAI API status and quotas

### Issue 3: Migration fails
**Solution:**
```bash
# Reset database (development only!)
npx prisma migrate reset

# Then re-run migrations
npx prisma migrate dev
```

### Issue 4: Prisma Client errors
**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue 5: Insights taking too long to load
**Possible Causes:**
- First-time generation (no cache)
- Large amount of user data
- OpenAI API slow response

**Solution:**
- This is normal for first generation
- Subsequent loads will be faster (cached)
- Consider implementing loading states in UI

## Performance Monitoring

### Database Queries
Monitor slow queries:
```sql
-- Check for slow insight queries
SELECT * FROM ai_insights 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- Check cache hit rate
SELECT 
  COUNT(*) FILTER (WHERE expires_at > NOW()) as active_cache,
  COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired_cache
FROM ai_insight_cache;
```

### API Monitoring
Watch for:
- Response times > 3000ms
- High error rates
- OpenAI API timeouts

### Cost Monitoring
Track OpenAI API usage:
- Set up billing alerts in OpenAI dashboard
- Monitor tokens per request
- Track daily/monthly costs

## Testing Checklist

- [ ] Database migration completed successfully
- [ ] Prisma Client generated
- [ ] OpenAI API key configured
- [ ] Student insights working
- [ ] Teacher insights working
- [ ] Admin insights working
- [ ] Dismiss functionality working
- [ ] Action tracking working
- [ ] Refresh functionality working
- [ ] Cache working correctly
- [ ] Error handling working
- [ ] Loading states showing
- [ ] No console errors
- [ ] Server logs look healthy

## Next Steps After Migration

1. **Monitor for 24-48 hours**
   - Check for any unexpected issues
   - Monitor API costs
   - Collect user feedback

2. **Optimize if needed**
   - Adjust cache duration
   - Fine-tune AI prompts
   - Optimize database queries

3. **Document learnings**
   - Note any issues encountered
   - Document solutions
   - Update this guide

4. **Plan enhancements**
   - Multi-language support
   - Custom prompts
   - Advanced analytics

## Support Contacts

- **Database Issues**: DBA team
- **API Issues**: Backend team
- **UI Issues**: Frontend team
- **OpenAI Issues**: DevOps/Infrastructure team

---

**Migration Prepared By**: Development Team
**Date**: November 18, 2025
**Estimated Downtime**: < 5 minutes (for database migration)
**Risk Level**: Low-Medium (new feature, existing features unaffected)
