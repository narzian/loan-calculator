# 📊 Analytics Setup Guide

## 🗄️ Database Setup (Supabase)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and click **"New Project"**
3. Choose:
   - **Name**: `loan-calculator-analytics`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Wait for project to initialize (~2 minutes)

### Step 2: Create Analytics Table
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase/analytics-schema.sql`
3. Click **"Run"** to create the table

### Step 3: Get Connection Details
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 4: Configure Environment Variables
Add these to your Cloudflare Pages environment variables:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 📈 What Data Gets Collected

### Calculation Events
Every time someone clicks "Calculate EMI":
```json
{
  "event_type": "calculation",
  "principal": 5000000,
  "interest_rate": 0.085,
  "term_years": 20,
  "monthly_payment": 43391,
  "total_interest": 5413840,
  "session_id": "sess_abc123",
  "timestamp": "2024-01-15T10:30:00Z",
  "viewport": {"width": 1920, "height": 1080}
}
```

### Page View Events
When someone visits the app:
```json
{
  "event_type": "pageview",
  "session_id": "sess_abc123",
  "referrer": "https://google.com",
  "viewport": {"width": 390, "height": 844}
}
```

### Export Events
When someone downloads PDF/CSV:
```json
{
  "event_type": "export",
  "export_type": "pdf",
  "schedule_length": 240,
  "session_id": "sess_abc123"
}
```

## 🔍 Analytics Queries

### 1. **Daily Calculation Trends**
```sql
-- See how many calculations per day
SELECT 
    DATE(created_at) as date,
    COUNT(*) as calculations,
    AVG(principal) as avg_loan_amount,
    AVG(interest_rate * 100) as avg_interest_rate,
    AVG(term_years) as avg_term_years
FROM analytics_events 
WHERE event_type = 'calculation'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

### 2. **Popular Loan Ranges**
```sql
-- What loan amounts are most common?
SELECT 
    CASE 
        WHEN principal < 1000000 THEN 'Under ₹10L'
        WHEN principal < 2500000 THEN '₹10L - ₹25L'
        WHEN principal < 5000000 THEN '₹25L - ₹50L'
        WHEN principal < 10000000 THEN '₹50L - ₹1Cr'
        ELSE 'Above ₹1Cr'
    END as loan_range,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM analytics_events 
WHERE event_type = 'calculation'
GROUP BY 1
ORDER BY count DESC;
```

### 3. **Interest Rate Distribution**
```sql
-- What interest rates do people check?
SELECT 
    ROUND(interest_rate * 100, 1) as interest_rate_percent,
    COUNT(*) as count
FROM analytics_events 
WHERE event_type = 'calculation'
GROUP BY interest_rate
ORDER BY interest_rate;
```

### 4. **Loan Term Preferences**
```sql
-- What loan terms are most popular?
SELECT 
    term_years,
    COUNT(*) as calculations,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM analytics_events 
WHERE event_type = 'calculation'
GROUP BY term_years
ORDER BY calculations DESC;
```

### 5. **Device Usage**
```sql
-- Mobile vs Desktop usage
SELECT 
    CASE 
        WHEN (viewport->>'width')::int < 768 THEN 'Mobile'
        WHEN (viewport->>'width')::int < 1024 THEN 'Tablet'
        ELSE 'Desktop'
    END as device_type,
    COUNT(*) as sessions
FROM analytics_events 
WHERE viewport IS NOT NULL
GROUP BY 1
ORDER BY sessions DESC;
```

### 6. **Export Behavior**
```sql
-- How often do people download results?
SELECT 
    export_type,
    COUNT(*) as downloads,
    AVG(schedule_length) as avg_schedule_length
FROM analytics_events 
WHERE event_type = 'export'
GROUP BY export_type;
```

### 7. **Session Analysis**
```sql
-- How many calculations per session?
SELECT 
    calculations_per_session,
    COUNT(*) as sessions
FROM (
    SELECT 
        session_id,
        COUNT(*) as calculations_per_session
    FROM analytics_events 
    WHERE event_type = 'calculation'
    GROUP BY session_id
) t
GROUP BY calculations_per_session
ORDER BY calculations_per_session;
```

### 8. **Peak Usage Hours**
```sql
-- What time do people use the calculator most?
SELECT 
    EXTRACT(hour FROM created_at) as hour,
    COUNT(*) as activities,
    COUNT(CASE WHEN event_type = 'calculation' THEN 1 END) as calculations
FROM analytics_events 
GROUP BY hour
ORDER BY hour;
```

### 9. **Recent Activity Summary**
```sql
-- Last 24 hours overview
SELECT 
    event_type,
    COUNT(*) as count,
    COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY event_type
ORDER BY count DESC;
```

### 10. **Conversion Funnel**
```sql
-- From pageview → calculation → export
WITH funnel AS (
    SELECT 
        session_id,
        MAX(CASE WHEN event_type = 'pageview' THEN 1 ELSE 0 END) as viewed,
        MAX(CASE WHEN event_type = 'calculation' THEN 1 ELSE 0 END) as calculated,
        MAX(CASE WHEN event_type = 'export' THEN 1 ELSE 0 END) as exported
    FROM analytics_events
    GROUP BY session_id
)
SELECT 
    SUM(viewed) as page_views,
    SUM(calculated) as calculations,
    SUM(exported) as exports,
    ROUND(SUM(calculated) * 100.0 / SUM(viewed), 2) as calculation_rate,
    ROUND(SUM(exported) * 100.0 / SUM(calculated), 2) as export_rate
FROM funnel;
```

## 🚀 Advanced Features

### Auto-Analytics Dashboard
Create a simple dashboard by saving these queries as **Views** in Supabase:

```sql
-- Create a daily summary view
CREATE VIEW daily_analytics AS 
SELECT 
    DATE(created_at) as date,
    COUNT(CASE WHEN event_type = 'pageview' THEN 1 END) as page_views,
    COUNT(CASE WHEN event_type = 'calculation' THEN 1 END) as calculations,
    COUNT(CASE WHEN event_type = 'export' THEN 1 END) as exports,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(CASE WHEN event_type = 'calculation' THEN principal END) as avg_loan_amount
FROM analytics_events 
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Data Retention Policy
```sql
-- Auto-delete data older than 1 year (optional)
DELETE FROM analytics_events 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## 💡 Business Insights You'll Get

1. **User Behavior**: What loan amounts and terms are most popular
2. **Market Trends**: How interest rate searches change over time
3. **Device Usage**: Mobile vs desktop usage patterns
4. **Feature Usage**: How often people export results
5. **Conversion Rates**: From visit → calculation → export
6. **Peak Times**: When your app is used most
7. **Session Depth**: How many calculations people do per session

## 🔒 Privacy & Compliance

✅ **GDPR Compliant**: No personal data stored
✅ **Anonymous**: Only anonymous session IDs
✅ **Secure**: Data stored in your private Supabase database
✅ **Minimal**: Only collects essential usage patterns
✅ **Transparent**: Users see no PII collection

## 📊 Free Tier Limits

**Supabase Free Tier**:
- ✅ 50,000 monthly API requests
- ✅ 500MB database storage
- ✅ Up to 2 projects

**Rough Estimates**:
- ~1,000 daily users = ~30,000 monthly events (well within limits)
- Each event ~1KB = ~30MB monthly storage
- **You're good for several thousand daily users on free tier!**