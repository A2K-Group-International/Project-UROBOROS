import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchUserById, updateContact } from "@/services/authService";
import { toast } from "./use-toast";
import {
  sendChangeEmailVerification,
  toggleNotification,
  updateEmail,
  updateName,
} from "@/services/userService";
import { supabase } from "@/services/supabaseClient";
import { useEffect } from "react";

export const useProfileChange = ({
  user_id,
  setIsDialogOpen,
  setIsEmailDialogOpen,
  setIsNameDialogOpen,
  form,
  emailForm,
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fetchUser", user_id],
    queryFn: async () => fetchUserById(user_id),
    enabled: !!user_id,
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load user profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ userId, newContactNumber }) =>
      updateContact(userId, newContactNumber),
    onSuccess: () => {
      toast({
        title: "Contact Updated",
        description: "The contact number has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Contact",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["fetchUser", user_id]);
      setIsDialogOpen(false);
    },
  });

  const sendEmailLinkMutation = useMutation({
    mutationFn: async ({ email }) => sendChangeEmailVerification(email),
    onSuccess: () => {
      toast({
        title: "Email change sent",
        description:
          "Change email link has been sent to your old and new email!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending change email link",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["fetchUser", user_id]);
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (data) => updateEmail(data),
    onSuccess: () => {
      toast({
        title: "Email has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Email",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["fetchUser", user_id]);
      setIsEmailDialogOpen(false);
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async (data) => updateName(data),
    onSuccess: () => {
      toast({
        title: "Name has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Email",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["fetchUser", user_id]);
      setIsNameDialogOpen(false);
    },
  });

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        const newEmail = localStorage.getItem("newEmail");

        if (newEmail === session.user.email) {
          updateEmailMutation.mutate({
            user_id: session.user.id,
            email: session.user.email,
          });
          localStorage.removeItem("newEmail");
          return;
        }
      }
    });

    form.setValue("contact_number", data?.contact_number);
    emailForm.setValue("email", data?.email);

    return () => {
      data.subscription.unsubscribe();
    };
  }, [data]);
  const toggleNotificationMutation = useMutation({
    mutationFn: async (data) => toggleNotification(data),
    onSuccess: () => {
      toast({
        title: "Notification has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Notification",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["fetchUser", user_id]);
    },
  });

  return {
    sendEmailLinkMutation,
    updateContactMutation,
    data,
    isLoading,
    updateEmailMutation,
    updateNameMutation,
    toggleNotificationMutation,
  };
};
