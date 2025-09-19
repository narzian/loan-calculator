-- Loan Calculator Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create saved calculations table
CREATE TABLE IF NOT EXISTS user_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calculation jsonb NOT NULL,
  tags text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency text DEFAULT 'USD',
  theme text DEFAULT 'light',
  notifications_enabled boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security on tables
ALTER TABLE user_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_calculations
-- Users can only see their own calculations
CREATE POLICY "Users can view own calculations" ON user_calculations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert calculations for themselves
CREATE POLICY "Users can insert own calculations" ON user_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own calculations
CREATE POLICY "Users can update own calculations" ON user_calculations
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own calculations
CREATE POLICY "Users can delete own calculations" ON user_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
-- Users can only see their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert preferences for themselves
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_calculations_user_id ON user_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calculations_created_at ON user_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_calculations_is_favorite ON user_calculations(user_id, is_favorite) WHERE is_favorite = true;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language plpgsql;

-- Create triggers to update updated_at automatically
CREATE TRIGGER update_user_calculations_updated_at BEFORE UPDATE
  ON user_calculations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE
  ON user_preferences FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create a view for calculation summaries (useful for listing)
CREATE OR REPLACE VIEW calculation_summaries AS
SELECT 
  id,
  user_id,
  name,
  (calculation->>'principal')::decimal as amount,
  (calculation->>'annualRate')::decimal as rate,
  (calculation->>'years')::integer as term,
  (calculation->>'monthlyPayment')::decimal as monthly_payment,
  tags,
  is_favorite,
  created_at,
  updated_at
FROM user_calculations;

-- Grant access to the view
GRANT SELECT ON calculation_summaries TO authenticated;

-- Sample data (optional - remove in production)
-- INSERT INTO user_calculations (user_id, name, calculation, tags, is_favorite) VALUES
-- (
--   auth.uid(),
--   'My First House',
--   '{"principal": 300000, "annualRate": 6.5, "years": 30, "monthlyPayment": 1896.20, "totalPayment": 682632, "totalInterest": 382632, "timestamp": "2024-01-15T10:00:00.000Z", "currency": "USD"}',
--   ARRAY['house', 'primary'],
--   true
-- );

-- Show tables and policies (for verification)
-- \dt
-- SELECT schemaname, tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public';
