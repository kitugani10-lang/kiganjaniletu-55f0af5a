
-- Add views column to posts
ALTER TABLE posts ADD COLUMN views integer NOT NULL DEFAULT 0;

-- Create function to increment views for multiple posts at once (callable by anyone including anon)
CREATE OR REPLACE FUNCTION increment_post_views(post_ids uuid[])
RETURNS void AS $$
BEGIN
  UPDATE posts SET views = views + 1 WHERE id = ANY(post_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint on username
ALTER TABLE profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Add check constraint on username length (6-20 chars)
ALTER TABLE profiles ADD CONSTRAINT profiles_username_length CHECK (char_length(username) >= 6 AND char_length(username) <= 20);

-- Add check constraint: only alphanumeric and underscore
ALTER TABLE profiles ADD CONSTRAINT profiles_username_chars CHECK (username ~ '^[a-zA-Z0-9_]+$');

-- Add trigger to validate banned usernames
CREATE OR REPLACE FUNCTION validate_username()
RETURNS trigger AS $$
BEGIN
  IF lower(NEW.username) IN ('admin', 'administration', 'utawala', 'admins', 'moderators', 'moderator', 'moderat') THEN
    RAISE EXCEPTION 'This username is not allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_banned_username
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();

-- Update posts UPDATE RLS to restrict edits to 12 hours
DROP POLICY IF EXISTS "Authors can update own posts" ON posts;
CREATE POLICY "Authors can update own posts within 12h" ON posts
  FOR UPDATE USING (auth.uid() = author_id AND created_at > now() - interval '12 hours');

-- Add UPDATE policy on comments (didn't exist before) with 12h limit
CREATE POLICY "Authors can update own comments within 12h" ON comments
  FOR UPDATE USING (auth.uid() = author_id AND created_at > now() - interval '12 hours');
