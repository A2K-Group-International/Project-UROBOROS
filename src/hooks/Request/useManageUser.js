import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { registerUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { getUsers, updateUser } from "@/services/userService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editingUserSchema,
  newUserSchema,
} from "@/zodSchema/Request/NewUserSchema";

const useManageUsers = ({
  onSuccessCallback = null,
  role = null,
  user = null,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(user ? editingUserSchema : newUserSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      contact_number: user?.contact_number || "",
      role: user?.role || "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const usersQuery = useInfiniteQuery({
    queryKey: ["users-list", role],
    queryFn: async ({ pageParam }) => {
      const roles =
        role === "parishioner" ? ["parishioner", "coparent"] : [role];
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

  const registerUserMutation = useMutation({
    mutationFn: registerUser,
    onMutate: () => {
      toast({
        title: "Creating Profile...",
        description: "Your profile is being created.",
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Created Successfully",
        description: "New profile has been created.",
      });

      // Invalidate the 'users' query so the list of users is refetched after creating the profile
      queryClient.invalidateQueries(["users-list", role]);

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error) => {
      toast({
        title: "Error Creating Profile",
        description:
          error.message ||
          "There was an issue creating the profile. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Optional: Additional logic after mutation is settled (e.g., cleanup)
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

      // Invalidate the 'users' query so the list of users is refetched after updating the profile
      queryClient.invalidateQueries(["users-list", role]);

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

  const onSubmit = async (data) => {
    try {
      const newUserPayload = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        password: data.password,
        contactNumber: data.contact_number,
        role: data.role,
      };

      const { password: _, confirm_password: __, ...updateUserPayload } = data;

      !user
        ? registerUserMutation.mutate(newUserPayload)
        : updateUserMutation.mutate({
            id: user?.id,
            payload: updateUserPayload,
          });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    form,
    onSubmit,
    usersQuery,
    isPending: registerUserMutation.isPending || updateUserMutation.isPending,
  };
};

export default useManageUsers;
