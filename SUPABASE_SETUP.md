# Supabase Integration Setup Guide

This guide will help you set up Supabase authentication, database, and storage for the BotCleaner SaaS application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys

## 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `apps/server/database/schema.sql`
4. This will create:
   - `users` table (extends auth.users)
   - `runs` table for processing history
   - Row Level Security (RLS) policies
   - Storage bucket and policies

## 3. Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a bucket named `exports` (if not created by the SQL script)
3. Set it to private
4. The RLS policies will be created by the SQL script

## 4. Environment Variables

### Web App (`apps/web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SERVER_URL=http://localhost:8000
```

### Server App (`apps/server/.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 5. Authentication Configuration

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000`)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

## 6. Features Implemented

### Authentication
- ✅ Email/password sign up and sign in
- ✅ Magic link authentication
- ✅ Protected routes
- ✅ User session management

### Database
- ✅ User profiles table
- ✅ Processing runs table
- ✅ Row Level Security (RLS) policies
- ✅ Automatic user profile creation

### Storage
- ✅ ZIP file storage in Supabase Storage
- ✅ Signed URLs for secure downloads
- ✅ User-specific file organization

### API Integration
- ✅ Authenticated API endpoints
- ✅ JWT token validation
- ✅ User-specific data access

## 7. API Endpoints

### Server Endpoints
- `POST /process` - Process CSV with authentication
- `GET /runs` - Get user's processing runs
- `DELETE /runs/{id}` - Delete a processing run
- `GET /download/{id}` - Get signed download URL

### Web API Routes
- `GET /api/runs` - Proxy to server runs endpoint
- `DELETE /api/runs/[id]` - Proxy to server delete endpoint
- `GET /api/download/[id]` - Proxy to server download endpoint

## 8. Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ User can only access their own data
- ✅ JWT token validation
- ✅ Secure file storage with signed URLs
- ✅ Protected API endpoints

## 9. User Flow

1. User signs up/signs in
2. User uploads CSV file
3. User configures processing options
4. Server processes file and uploads ZIP to Supabase Storage
5. Run data is saved to database
6. User can view history in dashboard
7. User can re-download files via signed URLs

## 10. Testing

1. Start both applications:
   ```bash
   # Terminal 1 - Web app
   cd apps/web
   npm run dev

   # Terminal 2 - Server app
   cd apps/server
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Visit `http://localhost:3000`
3. Sign up for a new account
4. Upload a CSV file and process it
5. Check the dashboard for your processing history

## 11. Production Considerations

- Update CORS settings for production domains
- Use proper JWT verification with public keys
- Configure proper redirect URLs
- Set up proper environment variables
- Consider rate limiting for API endpoints
- Monitor storage usage and costs

