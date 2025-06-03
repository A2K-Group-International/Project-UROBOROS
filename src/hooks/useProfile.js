import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import {
  sendChangeEmailVerification,
  updateEmail,
  updateName,
  updatePassword,
} from "@/services/userService";
import { fetchUserById, updateContact } from "@/services/authService";
import { supabase } from "@/services/supabaseClient";

const useProfile = ({ user_id }) => {
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
    },
  });

  // Mutation to send verification email for changing email
  const sendEmailLinkMutation = useMutation({
    mutationFn: async ({ email }) => sendChangeEmailVerification(email),
    onSuccess: () => {
      toast({
        title: "Verification emails sent",
        description:
          "Please check both your current and new email inboxes to complete the change.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending verification",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["fetchUser", user_id]);
    },
  });

  // Email change mutation
  const updateEmailMutation = useMutation({
    mutationFn: async ({ user_id, email }) => updateEmail({ user_id, email }),
    onSuccess: () => {
      toast({
        title: "Email Updated",
        description: "Your email has been successfully updated.",
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
    },
  });
  // Update contact number mutation
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
    },
  });
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, password }) =>
      updatePassword({ currentPassword, password }),
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Password",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
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
      }
    );
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [updateEmailMutation]);

  return {
    data,
    isLoading,
    updateNameMutation,
    sendEmailLinkMutation,
    updateContactMutation,
    updatePasswordMutation,
  };
};

export default useProfile;
