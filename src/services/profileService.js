import { supabase } from "./supabaseClient";

// Write profile fields to the `profiles` row, mirroring what was saved to `users`
export const updateProfileFields = async (userId, fields) => {
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId);

  if (error) throw error;
};
