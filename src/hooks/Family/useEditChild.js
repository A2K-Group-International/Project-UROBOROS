import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { updateChild } from "@/services/familyService";

const useEditChild = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, data }) => updateChild(childId, data),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data.first_name} ${data.last_name} updated successfully!`,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(["family-list"]);
    },
    onError: (error) => {
      toast({
        title: "Error Updating Child",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export default useEditChild;
