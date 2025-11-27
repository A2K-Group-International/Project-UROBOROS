import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { updateParent } from "@/services/familyService";

const useEditParent = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, data, parentUserId }) =>
      updateParent(parentId, data, parentUserId),
    onSuccess: (data, _variables) => {
      toast({
        title: "Success",
        description: `${data.first_name} ${data.last_name} updated successfully!`,
      });

      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries(["family-list"]);
    },
    onError: (error) => {
      toast({
        title: "Error Updating Parent",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export default useEditParent;
