
-- ⚠️ SECURITY FIX 1: Prevent privilege escalation on profiles UPDATE
-- Users could self-set is_verified=true, modify ip_address/last_login_ip
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- New policy: users can only update safe columns (using WITH CHECK to block protected fields)
CREATE POLICY "Users can update own safe fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a trigger to prevent users from modifying protected columns
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service_role or admins to change these fields
  IF (NEW.is_verified IS DISTINCT FROM OLD.is_verified) OR
     (NEW.ip_address IS DISTINCT FROM OLD.ip_address) OR
     (NEW.last_login_ip IS DISTINCT FROM OLD.last_login_ip) THEN
    -- Check if caller is admin (via RLS context)
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      -- Revert protected fields to original values
      NEW.is_verified := OLD.is_verified;
      NEW.ip_address := OLD.ip_address;
      NEW.last_login_ip := OLD.last_login_ip;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_fields_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_fields();

-- ⚠️ SECURITY FIX 2: Restrict likes to authenticated users only
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;

CREATE POLICY "Authenticated users can view likes"
ON public.likes
FOR SELECT
TO authenticated
USING (true);
