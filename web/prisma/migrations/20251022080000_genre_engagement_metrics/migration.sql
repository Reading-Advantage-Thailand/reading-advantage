-- Genre Engagement Metrics Materialized View
-- This view aggregates genre engagement data across students and classes
-- including reads, recency, quiz completions, XP earned, and CEFR bucketing

DROP MATERIALIZED VIEW IF EXISTS mv_genre_engagement_metrics CASCADE;

-- Main genre engagement metrics view for student/class scope
CREATE MATERIALIZED VIEW mv_genre_engagement_metrics AS
WITH base_engagement AS (
  SELECT 
    u.id as user_id,
    u."cefr_level",
    c.id as classroom_id,
    u."school_id",
    COALESCE(a.genre, ch.genre) as genre,
    
    -- Engagement activity data
    CASE 
      WHEN xp.activity_type = 'ARTICLE_READ' THEN a.id
      WHEN xp.activity_type IN ('CHAPTER_READ', 'STORIES_READ') THEN ch.id::text
      ELSE xp.activity_id
    END as content_id,
    
    xp.created_at as activity_date,
    xp.xp_earned,
    xp.activity_type,
    
    -- Quiz completion indicators
    CASE 
      WHEN xp.activity_type IN ('MC_QUESTION', 'SA_QUESTION', 'LA_QUESTION') THEN 1 
      ELSE 0 
    END as quiz_completion,
    
    -- Reading activity indicators  
    CASE 
      WHEN xp.activity_type IN ('ARTICLE_READ', 'CHAPTER_READ', 'STORIES_READ') THEN 1
      ELSE 0
    END as read_completion,
    
    -- CEFR bucket (simplified to main level)
    CASE 
      WHEN u."cefr_level" LIKE 'A1%' THEN 'A1'
      WHEN u."cefr_level" LIKE 'A2%' THEN 'A2'
      WHEN u."cefr_level" LIKE 'B1%' THEN 'B1'
      WHEN u."cefr_level" LIKE 'B2%' THEN 'B2'
      WHEN u."cefr_level" LIKE 'C1%' THEN 'C1'
      WHEN u."cefr_level" LIKE 'C2%' THEN 'C2'
      ELSE 'A1'
    END as cefr_bucket

  FROM "XPLogs" xp
  JOIN users u ON xp.user_id = u.id
  LEFT JOIN "classroomStudents" cs ON u.id = cs.student_id
  LEFT JOIN classrooms c ON cs.classroom_id = c.id
  LEFT JOIN article a ON xp.activity_id = a.id AND xp.activity_type IN ('ARTICLE_READ', 'ARTICLE_RATING')
  LEFT JOIN chapters ch ON xp.activity_id = ch.id::text AND xp.activity_type IN ('CHAPTER_READ', 'CHAPTER_RATING', 'STORIES_READ')
  
  WHERE xp.created_at >= NOW() - INTERVAL '6 months'
    AND COALESCE(a.genre, ch.genre) IS NOT NULL
    AND u.role IN ('STUDENT', 'USER')
),

-- Recency scoring (more recent = higher score)
recency_weighted AS (
  SELECT *,
    -- Exponential decay: activities in last 7 days get weight 1.0, 
    -- 30 days get 0.5, 90 days get 0.2, older gets 0.1
    CASE 
      WHEN activity_date >= NOW() - INTERVAL '7 days' THEN 1.0
      WHEN activity_date >= NOW() - INTERVAL '30 days' THEN 0.5
      WHEN activity_date >= NOW() - INTERVAL '90 days' THEN 0.2
      ELSE 0.1
    END as recency_weight
  FROM base_engagement
)

-- Final aggregated metrics
SELECT 
  user_id,
  classroom_id,
  school_id,
  genre,
  cefr_bucket,
  
  -- Read engagement metrics
  COUNT(DISTINCT CASE WHEN read_completion = 1 THEN content_id END) as total_reads,
  COUNT(DISTINCT CASE WHEN read_completion = 1 AND activity_date >= NOW() - INTERVAL '30 days' THEN content_id END) as recent_reads_30d,
  COUNT(DISTINCT CASE WHEN read_completion = 1 AND activity_date >= NOW() - INTERVAL '7 days' THEN content_id END) as recent_reads_7d,
  
  -- Quiz engagement metrics
  SUM(quiz_completion) as total_quiz_completions,
  SUM(CASE WHEN quiz_completion = 1 AND activity_date >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END) as recent_quiz_completions_30d,
  
  -- XP metrics
  SUM(xp_earned) as total_xp_earned,
  SUM(CASE WHEN activity_date >= NOW() - INTERVAL '30 days' THEN xp_earned ELSE 0 END) as recent_xp_30d,
  
  -- Weighted engagement score (combines recency + activity volume)
  SUM(
    (read_completion * 2.0 + quiz_completion * 1.5 + (xp_earned / 50.0)) * recency_weight
  ) as weighted_engagement_score,
  
  -- Time-based metrics
  MAX(activity_date) as last_activity_date,
  MIN(activity_date) as first_activity_date,
  COUNT(DISTINCT DATE(activity_date)) as active_days,
  
  -- Frequency metrics
  COUNT(*) as total_activities,
  COUNT(*) / GREATEST(EXTRACT(days FROM NOW() - MIN(activity_date)), 1) as daily_activity_rate,
  
  -- Data freshness
  NOW() as calculated_at

FROM recency_weighted
GROUP BY user_id, classroom_id, school_id, genre, cefr_bucket
HAVING COUNT(*) >= 3; -- Minimum activity threshold

-- Create indexes for efficient querying
CREATE INDEX CONCURRENTLY idx_genre_engagement_user_genre 
ON mv_genre_engagement_metrics (user_id, genre);

CREATE INDEX CONCURRENTLY idx_genre_engagement_classroom_genre 
ON mv_genre_engagement_metrics (classroom_id, genre) 
WHERE classroom_id IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_genre_engagement_school_genre 
ON mv_genre_engagement_metrics (school_id, genre) 
WHERE school_id IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_genre_engagement_cefr_genre 
ON mv_genre_engagement_metrics (cefr_bucket, genre);

CREATE INDEX CONCURRENTLY idx_genre_engagement_weighted_score 
ON mv_genre_engagement_metrics (weighted_engagement_score DESC);

-- Aggregated class-level view
CREATE MATERIALIZED VIEW mv_class_genre_engagement AS
SELECT 
  classroom_id,
  school_id,
  genre,
  cefr_bucket,
  
  -- Aggregated student metrics
  COUNT(DISTINCT user_id) as active_students,
  AVG(weighted_engagement_score) as avg_engagement_score,
  SUM(total_reads) as class_total_reads,
  SUM(total_quiz_completions) as class_total_quiz_completions,
  SUM(total_xp_earned) as class_total_xp,
  
  -- Class-level recency
  MAX(last_activity_date) as class_last_activity,
  AVG(daily_activity_rate) as avg_daily_activity_rate,
  
  -- CEFR distribution
  COUNT(DISTINCT user_id) FILTER (WHERE cefr_bucket = 'A1') as students_a1,
  COUNT(DISTINCT user_id) FILTER (WHERE cefr_bucket = 'A2') as students_a2,
  COUNT(DISTINCT user_id) FILTER (WHERE cefr_bucket = 'B1') as students_b1,
  COUNT(DISTINCT user_id) FILTER (WHERE cefr_bucket = 'B2') as students_b2,
  COUNT(DISTINCT user_id) FILTER (WHERE cefr_bucket = 'C1') as students_c1,
  COUNT(DISTINCT user_id) FILTER (WHERE cefr_bucket = 'C2') as students_c2,
  
  NOW() as calculated_at

FROM mv_genre_engagement_metrics
WHERE classroom_id IS NOT NULL
GROUP BY classroom_id, school_id, genre, cefr_bucket
HAVING COUNT(DISTINCT user_id) >= 2; -- At least 2 students

CREATE INDEX CONCURRENTLY idx_class_genre_engagement_classroom 
ON mv_class_genre_engagement (classroom_id, avg_engagement_score DESC);

CREATE INDEX CONCURRENTLY idx_class_genre_engagement_school 
ON mv_class_genre_engagement (school_id, genre);

-- Aggregated school-level view  
CREATE MATERIALIZED VIEW mv_school_genre_engagement AS
SELECT 
  school_id,
  genre,
  cefr_bucket,
  
  -- School-wide metrics
  COUNT(DISTINCT classroom_id) as active_classrooms,
  COUNT(DISTINCT user_id) as active_students,
  AVG(weighted_engagement_score) as avg_engagement_score,
  SUM(total_reads) as school_total_reads,
  SUM(total_quiz_completions) as school_total_quiz_completions,
  SUM(total_xp_earned) as school_total_xp,
  
  -- School-level trends
  MAX(last_activity_date) as school_last_activity,
  AVG(daily_activity_rate) as avg_daily_activity_rate,
  
  NOW() as calculated_at

FROM mv_genre_engagement_metrics
WHERE school_id IS NOT NULL
GROUP BY school_id, genre, cefr_bucket
HAVING COUNT(DISTINCT user_id) >= 5; -- At least 5 students

CREATE INDEX CONCURRENTLY idx_school_genre_engagement_school 
ON mv_school_genre_engagement (school_id, avg_engagement_score DESC);