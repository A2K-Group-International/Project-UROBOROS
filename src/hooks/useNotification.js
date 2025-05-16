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
import { toast } from "./use-toast";

/**
 * Hook to fetch and subscribe to real-time notifications

 * @param {boolean} enabled - Whether the query is enabled
 * @param {string} userId - User ID for fetching notifications
 * @param {boolean} isRead - Whether to fetch read notifications
 * @returns {Object} React Query result object
 */
export const useNotifications = ({ enabled = true, userId, isRead }) => {
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
      queryClient.setQueryData(
        ["notifications", { isRead: false }],
        (old = []) => [newNotification, ...old]
      );
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
export const useMarkNotificationAsRead = ({ isRead }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markSingleNotificationAsRead,
    // Optimistic update
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["notifications", { isRead }],
      });
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData([
        "notifications",
        { isRead },
      ]);
      // Optimistically update to the new value
      queryClient.setQueryData(["notifications", { isRead }], (oldData = []) =>
        oldData.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      toast({
        title: "Error marking notification as read",
        description: `${err.message}` || "Failed to mark notification as read",
        variant: "destructive",
      });

      // Rollback to the previous value
      queryClient.setQueryData(
        ["notifications", { isRead }],
        context.previousTodos
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["notifications", { isRead }]);

      queryClient.invalidateQueries(["unread-notification-count"]);
    },
  });
};

/**
 * Hook to delete a notification
 * @returns {Object} Mutation object with deleteNotification function
 */
export const useDeleteNotification = ({ isRead }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSingleNotification,
    // Optimistic update
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["notifications", { isRead }],
      });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData([
        "notifications",
        { isRead },
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["notifications", { isRead }], (oldData = []) =>
        oldData.filter((notification) => notification.id !== notificationId)
      );

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newTodo, context) => {
      toast({
        title: "Error deleting notification",
        description: `${err.message}` || "Failed to delete notification",
        variant: "destructive",
      });

      queryClient.setQueryData(
        ["notifications", { isRead }],
        context.previousTodos
      );
    },
    onSettled: () => {
      // Invalidate the query to refetch notifications
      queryClient.invalidateQueries(["notifications", { isRead }]);
      // Update the unread count if needed
      queryClient.invalidateQueries(["unread-notification-count"]);
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
