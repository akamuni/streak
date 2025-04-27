// Utility to get a consistent display name for a user
export function getUserDisplayName(
  profile: { username?: string; name?: string } | undefined,
  uid: string
): string {
  if (profile?.name) return profile.name
  if (profile?.username) return profile.username
  // No name or username => show shortened UID for identification
  return uid.slice(0, 8) + '...'
}
