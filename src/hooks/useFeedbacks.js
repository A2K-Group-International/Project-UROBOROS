import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import {
  publicCreateFeedback,
  updateFeedbackStatus,
} from "@/services/feedBackService";

const useFeedback = () => {
  const queryClient = useQueryClient();

  const createPublicFeedBackMutation = useMutation({
    mutationFn: publicCreateFeedback,
    onSuccess: (_data, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      // Call the onSuccess callback if provided
      if (context?.onSuccess) {
        context.onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback.",
      });
    },
  });

  const createPublicFeedBack = (data, onSuccess) => {
    createPublicFeedBackMutation.mutate(data, { onSuccess });
  };

  //Update feedback status
  const updateFeedbackStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await updateFeedbackStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
      toast({
        title: "Success",
        description: `Feedback status updated to ${variables.status}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feedback status.",
        variant: "destructive",
      });
    },
  });

  const updateFeedbackStatusHandler = (id, status) => {
    updateFeedbackStatusMutation.mutate({ id, status });
  };

  return {
    createPublicFeedBack,
    isPublicFeedbackPending: createPublicFeedBackMutation.isPending,
    updateFeedbackStatusHandler,
    isUpdatingFeedbackStatus: updateFeedbackStatusMutation.isPending,
  };
};

export default useFeedback;
