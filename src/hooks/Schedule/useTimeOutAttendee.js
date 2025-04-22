import { useMutation, useQueryClient } from "@tanstack/react-query";
import { timeOutAttendeeWithNotification } from "@/services/emailService";
import { useToast } from "../use-toast";

/**
 * Hook for managing attendee-related mutations and queries
 */
const useTimeOutAttendee = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for timing out attendees with email notifications
  const timeOutMutation = useMutation({
    mutationFn: async ({ attendeeId, selectedParentsEmails = [] }) => {
      // Then send notifications if emails were provided
      await timeOutAttendeeWithNotification({
        attendeeId,
        selectedParentsEmails,
      });

      return {
        notificationsSent: selectedParentsEmails.length > 0,
      };
    },
    onMutate: () => {
      toast({
        title: "Sending email...",
        description: "Please wait while we send the email.",
      });
    },
    onSuccess: (data) => {
      const { notificationsSent } = data;
      toast({
        title: "Time Out Successful",
        description: notificationsSent
          ? "The attendee has been timed out and notifications sent."
          : "The attendee has been timed out successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Processing Time Out",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Invalidate queries that might be affected by this mutation
      queryClient.invalidateQueries(["attendance"]);
    },
  });

  return {
    timeOutMutation,
    // Add other attendance-related queries or mutations as needed
  };
};

export default useTimeOutAttendee;
