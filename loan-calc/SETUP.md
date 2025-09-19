# Loan Calculator Setup Guide

## Phase 2: Backend Integration Setup

This guide will help you set up the Supabase backend integration for your loan calculator.

### Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed
3. Cloudflare Wrangler CLI installed (`npm install -g wrangler`)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from Project Settings > API
3. In the Supabase SQL Editor, paste and run the schema from `supabase/schema.sql`

### Step 2: Environment Configuration

#### For Local Development:
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit .env.local with your actual Supabase credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

#### For Production (Cloudflare Pages):
```bash
# Set secrets using Wrangler CLI
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY

# Or set via Cloudflare Dashboard:
# Go to Workers & Pages > Your Project > Settings > Environment Variables
```

### Step 3: Database Setup

Run the SQL schema in your Supabase project:

```sql
-- The schema is in supabase/schema.sql
-- This creates:
-- 1. user_calculations table
-- 2. Row Level Security (RLS) policies
-- 3. Indexes for performance
```

### Step 4: Test the Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run locally with serverless functions
npm run dev:full

# Test the API endpoints
curl http://localhost:8788/api/health
```

### Step 5: API Endpoints

Once set up, you'll have these endpoints available:

- `GET /api/health` - Health check
- `GET /api/calc` - Loan calculation (existing)
- `GET /api/saves` - List saved calculations (requires auth)
- `POST /api/saves` - Save a calculation (requires auth)
- `GET /api/saves/:id` - Get specific calculation (requires auth)
- `PUT /api/saves/:id` - Update calculation (requires auth)
- `DELETE /api/saves/:id` - Delete calculation (requires auth)

### Authentication

The API uses Bearer token authentication. In Phase 3, we'll add:
- Supabase Auth UI components
- Login/signup flows
- Token management
- Frontend integration with saved calculations

### Troubleshooting

#### Common Issues:

1. **API returns 500 with "Supabase configuration missing"**
   - Check that SUPABASE_URL and SUPABASE_ANON_KEY are set correctly
   - For local dev, ensure .env.local exists and is loaded

2. **API returns 401 "Authentication required"**
   - This is expected until Phase 3 (authentication) is implemented
   - The save endpoints require a valid Bearer token

3. **Database errors**
   - Ensure the SQL schema has been run in your Supabase project
   - Check that RLS policies are enabled

4. **CORS errors**
   - All endpoints include proper CORS headers
   - If issues persist, check browser developer tools for specifics

### Next Steps (Phase 3)

1. Add Supabase Auth components
2. Implement login/signup UI
3. Integrate frontend with save/load functionality
4. Add user profile management