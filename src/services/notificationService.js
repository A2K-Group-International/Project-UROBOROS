import { supabase } from "./supabaseClient";

/**
 * Fetches notifications from Supabase
 * @returns {Promise<Array>} Notifications array sorted by created_at descending
 */
export const getNotifications = async (userId) => {
  // Join the user_notifications with notifications to get both
  // the notification content and the user's read status
  const { data, error } = await supabase
    .from("user_notifications")
    .select(
      `
      id,
      is_read,
      notifications:notification_id (
        id,
        creator_id,
        created_at,
        type,
        title,
        body,
        entity_id
      )
    `
    )
    .eq("receiver_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Transform the nested structure to a flatter, more convenient format
  return data.map((item) => ({
    id: item.id, // user_notification.id
    notification_id: item.notifications.id,
    created_at: item.notifications.created_at,
    creator_id: item.notifications.creator_id,
    type: item.notifications.type,
    title: item.notifications.title,
    body: item.notifications.body,
    entity_id: item.notifications.entity_id,
    read: item.is_read,
  }));
};

export const getUnreadNotificationCount = async () => {
  // Get the current user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");
  const userId = user.id;

  const { count, error } = await supabase
    .from("user_notifications")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return count;
};

/**
 * Creates a real-time subscription to notification changes
 * @param {Function} onInsert Callback function triggered when a new notification is inserted
 * @returns {Object} Supabase channel object
 */
export const subscribeToNotifications = (onInsert, userId) => {
  return supabase
    .channel("notifications-db-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "user_notifications",
        filter: `receiver_id=eq.${userId}`,
      },
      async (payload) => {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("id", payload.new.notification_id)
          .single();

        if (error) {
          console.error("Error fetching notification:", error);
          return;
        }
        const fullNotification = {
          id: payload.new.id,
          notification_id: data.id,
          created_at: data.created_at,
          type: data.type,
          title: data.title,
          body: data.body,
          entity_id: data.entity_id,
          creator_id: data.creator_id,
          is_read: payload.new.is_read,
        };

        onInsert(fullNotification);
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
