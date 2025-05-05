import { supabase } from "./supabaseClient";

/**
 * Fetches notifications from Supabase
 * @returns {Promise<Array>} Notifications array sorted by created_at descending
 */
export const getNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const getUnreadNotificationCount = async () => {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  if (error) throw new Error(error.message);
  return count;
};

/**
 * Creates a real-time subscription to notification changes
 * @param {Function} onInsert Callback function triggered when a new notification is inserted
 * @returns {Object} Supabase channel object
 */
export const subscribeToNotifications = (onInsert) => {
  return supabase
    .channel("notifications-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        onInsert(payload.new);
      }
    )
    .subscribe();
};

/**
 * Removes a Supabase channel subscription
 * @param {Object} channel Supabase channel to remove
 */
export const unsubscribeFromNotifications = (channel) => {
  supabase.removeChannel(channel);
};
