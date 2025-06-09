import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { addPoll } from "@/services/pollServices";

const usePoll = () => {
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
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  return {
    createPollMutation,
  };
};

export default usePoll;
