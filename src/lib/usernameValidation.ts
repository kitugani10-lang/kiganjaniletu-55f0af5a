const BANNED_USERNAMES = [
  'admin', 'administration', 'utawala', 'admins',
  'moderators', 'moderator', 'moderat',
];

export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < 6) return 'Username must be at least 6 characters';
  if (trimmed.length > 20) return 'Username must be at most 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) return 'Username can only contain letters, numbers, and underscores';
  if (BANNED_USERNAMES.includes(trimmed.toLowerCase())) return 'This username is not allowed';
  return null;
}
