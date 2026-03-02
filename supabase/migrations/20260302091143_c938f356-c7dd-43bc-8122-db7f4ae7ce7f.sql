
-- Fix search_path on functions for security
ALTER FUNCTION increment_post_views(uuid[]) SET search_path = 'public';
ALTER FUNCTION validate_username() SET search_path = 'public';
