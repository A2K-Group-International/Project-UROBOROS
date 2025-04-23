import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import { publicCreateFeedback } from "@/services/feedBackService";

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

  return {
    createPublicFeedBack,
    isPublicFeedbackPending: createPublicFeedBackMutation.isPending,
  };
};

export default useFeedback;
