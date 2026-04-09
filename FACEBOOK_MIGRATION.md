# Facebook Video Support - Database Migration

The Facebook video feature has been added to the application code, but the database constraint needs to be updated manually.

## To Complete the Setup:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the following SQL:

```sql
-- Update the taverns table to allow facebook as a video platform
ALTER TABLE IF EXISTS public.taverns 
DROP CONSTRAINT IF EXISTS taverns_video_platform_check;

ALTER TABLE IF EXISTS public.taverns 
ADD CONSTRAINT taverns_video_platform_check 
CHECK (video_platform IN ('youtube', 'tiktok', 'facebook'));
```

5. Click "Run" to execute the migration
6. You should see "Query executed successfully"

After this, users will be able to select Facebook as a video platform when adding or editing stops in the admin dashboard.

## What Was Changed:

- **App Code**: Updated video utilities to parse Facebook URLs
- **Forms**: Added Facebook button as a third option in add-stop and edit-stop forms
- **Types**: Updated TypeScript types to include 'facebook' as valid platform
- **Database Schema**: The 001_create_taverns.sql script has been updated to include 'facebook' in the constraint for future deployments
