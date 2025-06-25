import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  addPoll,
  addTimeSlot,
  deletePoll,
  editPolls,
  fetchPollDates,
  finalisePoll,
  manualClosePoll,
} from "@/services/pollServices";

const usePoll = ({ poll_id, user_id } = { poll_id: null, user_id: null }) => {
  const queryClient = useQueryClient();

  const createPollMutation = useMutation({
    mutationFn: addPoll,
    onSuccess: () => {
      toast({
        title: "Poll created successfully!",
        description:
          "Your poll has been created and shared with the community.",
      });

      // Invalidate polls query to refresh the list
      queryClient.invalidateQueries(["polls"]);
    },
    onError: (error) => {
      toast({
        title: "Error creating poll",
        description: `An error occurred while creating the poll: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addTimeSlotMutation = useMutation({
    mutationFn: addTimeSlot,
    onSuccess: (data) => {
      toast({
        title: `${data.message}`,
        description: "The time slot has been added to the poll.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error adding time slot",
        description: error.message || "An unknown error occurred.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["pollDates", poll_id]);
    },
  });
  const PollDates = useQuery({
    queryKey: ["pollDates", poll_id],
    queryFn: async () => await fetchPollDates({ poll_id }),
    enabled: !!poll_id,
  });

  const DeletePollMutation = useMutation({
    mutationFn: deletePoll,
    onSuccess: () => {
      toast({
        title: "Poll deleted successfully!",
        description: "The poll has been removed from the system.",
      });
      queryClient.invalidateQueries(["polls", user_id]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting poll",
        description: error.message || "An unknown error occurred.",
      });
    },
  });

  const editPollMutation = useMutation({
    mutationFn: editPolls,
    onSuccess: () => {
      toast({
        title: "Poll updated successfully!",
        description: "Your changes have been saved.",
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["polls"]);
      if (poll_id) {
        queryClient.invalidateQueries(["pollDates", poll_id]);
        queryClient.invalidateQueries(["poll", poll_id]);
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating poll",
        description: `An error occurred while updating the poll: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const manualClosePollMutation = useMutation({
    mutationFn: () => manualClosePoll(poll_id),
    onSuccess: () => {
      toast({
        title: "Poll closed successfully",
        description: "The poll has been manually closed.",
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(["polls"]);
      queryClient.invalidateQueries(["poll", poll_id]);
      queryClient.invalidateQueries(["pollDates", poll_id]);
    },

    onError: (error) => {
      toast({
        title: "Failed to close poll",
        description:
          error.message || "An error occurred while closing the poll.",
        variant: "destructive",
      });
    },
  });

  const finalizePollMutation = useMutation({
    mutationFn: ({ pollDate, pollTime }) =>
      finalisePoll({ pollId: poll_id, pollDate, pollTime }),
    onSuccess: (data) => {
      toast({
        title: "Poll finalised successfully",
        description: data.message || "The poll has been finalized.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to finalize poll",
        description:
          error.message || "An error occurred while finalizing the poll.",
        variant: "destructive",
      });
    },
  });

  return {
    createPollMutation,
    addTimeSlotMutation,
    PollDates,
    DeletePollMutation,
    editPollMutation,
    manualClosePollMutation,
    finalizePollMutation,
  };
};

export default usePoll;
