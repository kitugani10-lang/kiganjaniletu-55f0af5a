
-- ⚠️ SECURITY FIX: Remove overly permissive SELECT policies on profiles table
-- These policies expose sensitive data (ip_address, last_login_ip, location, gender, age) to everyone

-- Drop the two permissive SELECT policies that use USING(true)
DROP POLICY IF EXISTS "Anon can select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create restrictive policies:
-- 1. Users can see their own full profile
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Admins/moderators can view all profiles (for moderation)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'moderator')
);

-- NOTE: For public profile data (username, avatar, is_verified), 
-- the existing profiles_public view should be used instead.
-- The profiles_public view already exposes only safe columns.
