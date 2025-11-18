# AI Insights Feature - Implementation Guide

## Overview

This document describes the new AI Insights feature that provides real, AI-generated personalized recommendations for students, teachers, and administrators in the Reading Advantage platform.

## Features

### 1. Real AI Integration
- Uses OpenAI GPT models to generate personalized insights
- Analyzes actual user data (reading patterns, progress, engagement)
- Provides actionable, context-aware recommendations

### 2. Multi-Level Insights
- **Student Level**: Personal learning insights, reading recommendations, progress alerts
- **Teacher Level**: Classroom management insights, student engagement alerts, assignment recommendations
- **Classroom Level**: Class-wide performance trends, struggling student identification
- **License/School Level**: School-wide analytics, license utilization, ROI metrics

### 3. Interactive Features
- Dismiss insights that are not relevant
- Mark insights as "action taken" for tracking
- Refresh/regenerate insights with latest data
- Automatic caching to reduce AI API costs

## Database Schema

### AIInsight Model
```prisma
model AIInsight {
  id           String          @id @default(cuid())
  type         AIInsightType   // TREND, ALERT, RECOMMENDATION, ACHIEVEMENT, WARNING
  scope        AIInsightScope  // STUDENT, TEACHER, CLASSROOM, LICENSE, SYSTEM
  priority     AIInsightPriority // LOW, MEDIUM, HIGH, CRITICAL
  title        String
  description  String          @db.Text
  confidence   Float           // 0.0 to 1.0
  data         Json?
  
  // Context references
  userId       String?
  classroomId  String?
  licenseId    String?
  
  // Metadata
  generatedBy  String          @default("ai")
  modelVersion String?
  dismissed    Boolean         @default(false)
  dismissedAt  DateTime?
  actionTaken  Boolean         @default(false)
  
  // Timestamps
  validUntil   DateTime?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}
```

### AIInsightCache Model
Stores cached insights to reduce API calls and improve performance.

## API Endpoints

### 1. GET /api/v1/ai/summary
Generate or retrieve AI insights.

**Query Parameters:**
- `kind`: 'student' | 'teacher' | 'classroom' | 'license'
- `userId`: User ID (for student/teacher insights)
- `classroomId`: Classroom ID (for classroom insights)
- `licenseId`: License ID (for admin insights)
- `refresh`: 'true' to force regeneration

**Response:**
```json
{
  "insights": [
    {
      "id": "insight-123",
      "type": "recommendation",
      "title": "Consider Higher Level Content",
      "description": "Your recent scores average 95%. Try reading A2 level articles to challenge yourself.",
      "confidence": 0.92,
      "priority": "high",
      "data": { "averageScore": 0.95, "suggestedLevel": "A2" },
      "createdAt": "2025-11-18T10:00:00Z"
    }
  ],
  "summary": {
    "totalInsights": 5,
    "highPriority": 2,
    "lastGenerated": "2025-11-18T10:00:00Z"
  },
  "status": "ready",
  "cache": {
    "cached": true,
    "generatedAt": "2025-11-18T10:00:00Z"
  }
}
```

### 2. POST /api/v1/ai/insights/dismiss
Dismiss an insight.

**Body:**
```json
{
  "insightId": "insight-123"
}
```

### 3. POST /api/v1/ai/insights/action
Mark an insight as action taken.

**Body:**
```json
{
  "insightId": "insight-123"
}
```

### 4. DELETE /api/v1/ai/insights/cache
Clear cached insights to force regeneration.

**Query Parameters:**
- `userId`, `classroomId`, or `licenseId`

## Service Layer

### AI Insight Generation Service
Location: `server/services/ai-insight-service.ts`

**Key Functions:**

1. **generateStudentInsights(userId)**: Analyzes student's reading history, progress, and generates personalized insights
2. **generateTeacherInsights(userId)**: Analyzes teacher's classrooms and student engagement
3. **generateClassroomInsights(classroomId)**: Analyzes classroom-wide metrics
4. **generateLicenseInsights(licenseId)**: Generates school/license-level insights

**Metrics Analyzed:**
- Reading velocity (articles per day/week)
- Genre diversity
- Assignment completion rate
- Days since last activity
- XP progression
- CEFR level advancement
- Engagement patterns
- Performance trends

## Component Usage

### Dashboard Integration

#### Student Dashboard
```tsx
import AIInsights from "@/components/dashboard/ai-insights";

<AIInsights scope="student" contextId={userId} />
```

#### Teacher Dashboard
```tsx
<AIInsights scope="teacher" contextId={teacherId} />
```

#### Classroom Reports
```tsx
<AIInsights scope="classroom" contextId={classroomId} />
```

#### Admin Dashboard
```tsx
<AIInsights scope="license" contextId={licenseId} />
```

## Migration Instructions

1. **Run Prisma Migration:**
   ```bash
   npx prisma migrate dev --name add-ai-insights
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Verify OpenAI API Key:**
   Ensure `OPENAI_API_KEY` is set in your environment variables.

4. **Test AI Generation:**
   ```bash
   # Access any dashboard and check browser console for AI generation logs
   ```

## Performance Optimization

### Caching Strategy
- Insights are cached for 7 days by default
- Valid insights are served from cache unless `refresh=true`
- Old insights are automatically cleaned up

### Cost Management
- AI generation only occurs when:
  - No cached insights exist
  - User explicitly refreshes
  - Cached insights have expired
- Uses `gpt-4o-mini` model for cost efficiency
- Batches multiple insights in single API call

### Error Handling
- Fallback to generic insights if AI fails
- Graceful degradation for missing data
- User-friendly error messages

## Best Practices

1. **Regular Monitoring**: Check AI insight quality and relevance
2. **User Feedback**: Track dismiss/action rates to improve prompts
3. **Cost Tracking**: Monitor OpenAI API usage
4. **Data Quality**: Ensure sufficient user data for meaningful insights
5. **Privacy**: Insights are personalized but never expose other users' data

## Future Enhancements

1. **Multi-language Support**: Generate insights in user's preferred language
2. **Custom Prompts**: Allow admins to customize AI prompts
3. **Insight History**: Track insight effectiveness over time
4. **A/B Testing**: Test different insight formats
5. **Predictive Analytics**: Early warning system for at-risk students
6. **Automated Actions**: Auto-assign content based on insights

## Troubleshooting

### No Insights Generated
- Check if user has sufficient activity data (minimum 3-5 activities)
- Verify OpenAI API key is valid
- Check console logs for API errors

### Insights Not Updating
- Force refresh using the refresh button
- Clear cache via API endpoint
- Check if insights are within valid period

### API Errors
- Verify database migrations are applied
- Check OpenAI API quotas and limits
- Review server logs for detailed errors

## Support

For issues or questions:
1. Check server logs: Look for `[API] /api/ai/summary` entries
2. Review Prisma schema: Ensure models are properly migrated
3. Test API directly: Use Postman or curl to test endpoints
4. Contact development team with error logs

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
