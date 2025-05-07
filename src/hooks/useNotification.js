import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  markSingleNotificationAsRead,
  deleteSingleNotification,
  deleteAllUserNotifications,
  markAllAsRead,
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

/**
 * Hook to mark a notification as read
 * @returns {Object} Mutation object with markAsRead function
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markSingleNotificationAsRead,
    onSuccess: (updatedNotification) => {
      // Remove the notification from unread list
      queryClient.setQueryData(
        ["notifications", { isRead: false }],
        (oldData = []) =>
          oldData.filter(
            (notification) => notification.id !== updatedNotification.id
          )
      );

      // Add the notification to the read list (if it's being viewed)
      queryClient.setQueryData(
        ["notifications", { isRead: true }],
        (oldData = []) => {
          // Only update if this query exists in cache
          if (!oldData) return oldData;

          // Add the updated notification to the read list
          return [updatedNotification, ...oldData];
        }
      );

      // Update the unread notification count
      queryClient.invalidateQueries(["unread-notification-count"]);
    },
  });
};

/**
 * Hook to delete a notification
 * @returns {Object} Mutation object with deleteNotification function
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSingleNotification,
    onSuccess: (_, notificationId) => {
      // Optimistically remove from both read and unread lists
      queryClient.setQueryData(
        ["notifications", { isRead: false }],
        (oldData = []) =>
          oldData.filter((notification) => notification.id !== notificationId)
      );

      queryClient.setQueryData(
        ["notifications", { isRead: true }],
        (oldData = []) =>
          oldData.filter((notification) => notification.id !== notificationId)
      );

      // Update the unread count if needed
      queryClient.invalidateQueries(["unread-notification-count"]);
    },
    onError: (error) => {
      console.error("Error deleting notification:", error);
      // You could add toast notifications here
    },
  });
};

/**
 * Hook to delete all notifications for current user
 * @returns {Object} Mutation object with clearAllNotifications function
 */
export const useClearAllNotifications = (receiverId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAllUserNotifications(receiverId),
    onSuccess: () => {
      // Optimistically clear both read and unread lists
      queryClient.setQueryData(["notifications", { isRead: true }], []);

      // Reset the unread count
      queryClient.setQueryData(["unread-notification-count"], 0);
    },
    onError: (error) => {
      console.error("Error clearing notifications:", error);
      // You could add toast notifications here
    },
  });
};

export const useMarkAllAsRead = (receiverId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(receiverId),
    onSuccess: () => {
      // Optimistically update the read and unread lists
      queryClient.setQueryData(["notifications", { isRead: false }], []);
      queryClient.setQueryData(
        ["notifications", { isRead: true }],
        (oldData) => {
          if (!oldData) return [];
          return [
            ...oldData,
            ...oldData.filter((notification) => !notification.is_read),
          ];
        }
      );

      // Reset the unread count
      queryClient.setQueryData(["unread-notification-count"], 0);
    },
    onError: (error) => {
      console.error("Error marking notifications as read:", error);
    },
  });
};
