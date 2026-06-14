import { User } from "@supabase/supabase-js";

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.user_metadata?.is_admin === true;
}
