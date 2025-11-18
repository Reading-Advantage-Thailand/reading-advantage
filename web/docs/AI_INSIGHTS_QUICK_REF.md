# AI Insights - Quick Reference

## 🚀 Quick Start

### Using AI Insights Component

```tsx
import AIInsights from "@/components/dashboard/ai-insights";

// Student Dashboard
<AIInsights scope="student" contextId={userId} />

// Teacher Dashboard
<AIInsights scope="teacher" contextId={teacherId} />

// Classroom Reports
<AIInsights scope="classroom" contextId={classroomId} />

// Admin Dashboard
<AIInsights scope="license" contextId={licenseId} />
```

## 📡 API Endpoints

### Get Insights
```typescript
GET /api/v1/ai/summary?kind=student&userId=xxx
GET /api/v1/ai/summary?kind=teacher&userId=xxx
GET /api/v1/ai/summary?kind=classroom&classroomId=xxx
GET /api/v1/ai/summary?kind=license&licenseId=xxx
GET /api/v1/ai/summary?refresh=true  // Force regenerate
```

### Manage Insights
```typescript
POST /api/v1/ai/insights/dismiss
Body: { "insightId": "xxx" }

POST /api/v1/ai/insights/action
Body: { "insightId": "xxx" }

DELETE /api/v1/ai/insights/cache?userId=xxx
```

## 🔧 Service Functions

```typescript
import {
  generateStudentInsights,
  generateTeacherInsights,
  generateClassroomInsights,
  generateLicenseInsights,
  saveInsights,
  getCachedInsights
} from "@/server/services/ai-insight-service";

// Generate insights
const insights = await generateStudentInsights(userId);

// Save to database
await saveInsights(insights, "STUDENT", userId);

// Get cached
const cached = await getCachedInsights("STUDENT", userId);
```

## 💾 Database Models

### AIInsight
```typescript
{
  id: string
  type: "TREND" | "ALERT" | "RECOMMENDATION" | "ACHIEVEMENT" | "WARNING"
  scope: "STUDENT" | "TEACHER" | "CLASSROOM" | "LICENSE" | "SYSTEM"
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  title: string
  description: string
  confidence: number  // 0.0 to 1.0
  data: Json
  userId?: string
  classroomId?: string
  licenseId?: string
  dismissed: boolean
  actionTaken: boolean
  validUntil?: DateTime
}
```

## 🎯 Common Use Cases

### 1. Add insights to new dashboard
```tsx
"use client";
import AIInsights from "@/components/dashboard/ai-insights";

export function MyDashboard({ userId }) {
  return (
    <div>
      <h1>My Dashboard</h1>
      <AIInsights scope="student" contextId={userId} />
    </div>
  );
}
```

### 2. Programmatically generate insights
```typescript
import { generateStudentInsights, saveInsights } from "@/server/services/ai-insight-service";

async function refreshUserInsights(userId: string) {
  const insights = await generateStudentInsights(userId);
  await saveInsights(insights, "STUDENT", userId);
  return insights;
}
```

### 3. Custom insight filtering
```typescript
import { prisma } from "@/lib/prisma";

// Get high priority insights only
const highPriorityInsights = await prisma.aIInsight.findMany({
  where: {
    userId,
    priority: { in: ["HIGH", "CRITICAL"] },
    dismissed: false,
    validUntil: { gte: new Date() }
  }
});

// Get recommendations only
const recommendations = await prisma.aIInsight.findMany({
  where: {
    userId,
    type: "RECOMMENDATION",
    dismissed: false
  }
});
```

### 4. Batch generate insights
```typescript
async function generateInsightsForAllStudents() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" }
  });
  
  for (const student of students) {
    try {
      const insights = await generateStudentInsights(student.id);
      await saveInsights(insights, "STUDENT", student.id);
    } catch (error) {
      console.error(`Failed for student ${student.id}:`, error);
    }
  }
}
```

## 🔍 Debugging

### Check if insights exist
```typescript
const insights = await prisma.aIInsight.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" }
});
console.log(`Found ${insights.length} insights for user ${userId}`);
```

### Check cache status
```typescript
const cache = await prisma.aIInsightCache.findUnique({
  where: { cacheKey: `student:${userId}` }
});
console.log("Cache:", cache ? "Hit" : "Miss");
```

### Test AI generation directly
```typescript
import { generateStudentInsights } from "@/server/services/ai-insight-service";

const insights = await generateStudentInsights("user-id-here");
console.log("Generated insights:", insights);
```

## ⚡ Performance Tips

1. **Use caching**: Don't regenerate unless necessary
2. **Batch operations**: Generate for multiple users in background jobs
3. **Monitor costs**: Track OpenAI API usage
4. **Set appropriate expiry**: Default is 7 days, adjust as needed
5. **Clean old data**: Remove expired insights periodically

## 🐛 Common Errors

### "No insights generated"
- User needs more activity data (min 3-5 activities)
- Check if OpenAI API key is valid
- Check OpenAI API quotas

### "Failed to fetch AI insights"
- Check network connectivity
- Verify API endpoints are accessible
- Check authentication/session

### "Prisma Client not found"
- Run `npx prisma generate`
- Restart dev server

## 📊 Metrics to Track

```typescript
// Insight effectiveness
const dismissed = await prisma.aIInsight.count({
  where: { dismissed: true }
});
const acted = await prisma.aIInsight.count({
  where: { actionTaken: true }
});
console.log(`Dismiss rate: ${dismissed / total * 100}%`);
console.log(`Action rate: ${acted / total * 100}%`);

// Cache hit rate
const cacheHits = await prisma.aIInsightCache.count({
  where: { expiresAt: { gte: new Date() } }
});
```

## 🔐 Security Notes

- Insights are user-scoped (can't see other users' insights)
- API endpoints require authentication
- Sensitive data is not included in insights
- All data is encrypted in transit

## 📚 Related Files

- Schema: `prisma/schema.prisma`
- Service: `server/services/ai-insight-service.ts`
- Controller: `server/controllers/ai-controller.ts`
- Component: `components/dashboard/ai-insights.tsx`
- API Routes: `app/api/v1/ai/**/*.ts`
- Docs: `docs/AI_INSIGHTS_*.md`

## 🆘 Getting Help

1. Check server logs: Look for `[API] /api/ai/summary`
2. Check browser console for errors
3. Review documentation: `docs/AI_INSIGHTS_IMPLEMENTATION.md`
4. Test API endpoints directly with curl/Postman
5. Check OpenAI API dashboard for issues

---

**Last Updated**: November 18, 2025
