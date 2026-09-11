import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getUsers, updateUser } from "@/services/userService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editingUserSchema } from "@/zodSchema/Request/NewUserSchema";

const useManageUsers = ({
  onSuccessCallback = null,
  role = null,
  user = null,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(editingUserSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      mobile_number: user?.mobile_number || "",
      role: user?.role || "",
    },
  });

  const usersQuery = useInfiniteQuery({
    queryKey: ["users-list", role],
    queryFn: async ({ pageParam }) => {
      const roles = [role];
      const response = await getUsers({
        // activeFilter,
        page: pageParam,
        pageSize: 10,
        roles,
      });

      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onMutate: () => {
      toast({
        title: "Updating Profile...",
        description: "Your profile is being updated.",
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated Successfully",
        description: "The profile has been updated.",
      });

      // Refetch every role's users list, since the edited user's role may have changed
      queryClient.invalidateQueries({ queryKey: ["users-list"] });

      // Call the onSuccess callback to close the dialog
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      toast({
        title: "Error Updating Profile",
        description:
          error.message ||
          "There was an issue updating the profile. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Optional: Additional logic after mutation is settled (e.g., cleanup)
    },
  });

  const onSubmit = (data) => {
    updateUserMutation.mutate({
      id: user?.id,
      payload: data,
    });
  };

  return {
    form,
    onSubmit,
    usersQuery,
    isPending: updateUserMutation.isPending,
  };
};

export default useManageUsers;
