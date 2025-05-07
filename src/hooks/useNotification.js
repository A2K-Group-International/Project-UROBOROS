import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "../services/notificationService";

/**
 * Hook to fetch and subscribe to real-time notifications
 * @returns {Object} React Query result object
 */
export const useNotifications = ({
  enabled = true,
  userId,
  isRead = false,
}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", { isRead }],
    queryFn: () => getNotifications(userId, isRead),
    enabled,
  });

  // real-time updates - only apply for unread notifications
  useEffect(() => {
    // Only subscribe to real-time updates for unread notifications
    if (isRead) return;
    // Handler for new notifications
    const handleNewNotification = (newNotification) => {
      queryClient.setQueryData(["notifications", false], (old = []) => [
        newNotification,
        ...old,
      ]);
    };

    // Create subscription
    const channel = subscribeToNotifications(handleNewNotification, userId);

    // Cleanup function
    return () => {
      unsubscribeFromNotifications(channel);
    };
  }, [queryClient, userId, isRead]);

  return query;
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: getUnreadNotificationCount,
    staleTime: 1000 * 30,
  });
};
