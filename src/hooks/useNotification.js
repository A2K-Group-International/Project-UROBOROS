import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  getNotifications,
  subscribeToNotifications,
  unsubscribeFromNotifications,
} from "../services/notificationService";

/**
 * Hook to fetch and subscribe to real-time notifications
 * @returns {Object} React Query result object
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  // real-time updates
  useEffect(() => {
    // Handler for new notifications
    const handleNewNotification = (newNotification) => {
      queryClient.setQueryData(["notifications"], (old = []) => [
        newNotification,
        ...old,
      ]);
    };

    // Create subscription
    const channel = subscribeToNotifications(handleNewNotification);

    // Cleanup function
    return () => {
      unsubscribeFromNotifications(channel);
    };
  }, [queryClient]);

  return query;
};
