-- Analytics Schema for Loan Calculator
-- This table stores anonymous analytics data without any personal information

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Event metadata
  event_type TEXT NOT NULL, -- 'calculation', 'pageview', 'export'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  
  -- Calculation data (only for calculation events)
  principal NUMERIC,
  interest_rate NUMERIC,
  term_years INTEGER,
  monthly_payment NUMERIC,
  total_interest NUMERIC,
  
  -- Export data (only for export events)
  export_type TEXT, -- 'csv', 'pdf'
  schedule_length INTEGER,
  
  -- Technical metadata
  viewport JSONB, -- {width: number, height: number}
  user_agent TEXT,
  referrer TEXT,
  
  -- Environment data
  server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  environment TEXT DEFAULT 'production',
  app_version TEXT DEFAULT '1.0.0',
  
  -- Additional flexible data
  metadata JSONB DEFAULT '{}',
  
  -- Indexes for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

-- Create index for calculation trend analysis
CREATE INDEX IF NOT EXISTS idx_analytics_calculation_trends 
ON analytics_events(event_type, principal, interest_rate, term_years) 
WHERE event_type = 'calculation';

-- Row Level Security (RLS) - Allow inserts without authentication for analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous inserts (for analytics tracking)
-- This allows the app to insert analytics data without user authentication
CREATE POLICY "Allow anonymous analytics inserts" 
ON analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Policy to prevent public reads (only server can read analytics)
-- This ensures users can't see analytics data
CREATE POLICY "Restrict analytics reads" 
ON analytics_events 
FOR SELECT 
USING (false); -- Only authenticated service role can read

-- Comment the table
COMMENT ON TABLE analytics_events IS 'Anonymous analytics events for loan calculator usage tracking';

-- Comment important columns
COMMENT ON COLUMN analytics_events.session_id IS 'Anonymous session ID, not linked to users';
COMMENT ON COLUMN analytics_events.principal IS 'Loan amount in base currency units';
COMMENT ON COLUMN analytics_events.interest_rate IS 'Annual interest rate as decimal (0.085 for 8.5%)';
COMMENT ON COLUMN analytics_events.term_years IS 'Loan term in years';
COMMENT ON COLUMN analytics_events.user_agent IS 'Truncated user agent string for device insights';
COMMENT ON COLUMN analytics_events.metadata IS 'Additional flexible data for future analytics needs';