import { useUser } from "@/context/useUser";
import { toast, useToast } from "@/hooks/use-toast";
import {
  useFetchChildren,
  useFetchFamilyId,
  useFetchGuardian,
} from "@/hooks/useFamily";
import {
  acceptFamilyInvitation,
  inviteFamilyMember,
} from "@/services/familyService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const useFamilyData = () => {
  const { userData } = useUser();
  const userId = userData?.id;

  // Fetch familyId based on userId
  const {
    data: familyData,
    isLoading: isFamilyLoading,
    error: familyError,
  } = useFetchFamilyId(userId);

  const familyId = familyData?.id;

  // Fetch guardian data based on familyId
  const {
    data: parentData,
    isLoading: isParentLoading,
    error: parentError,
  } = useFetchGuardian(familyId);

  // Fetch child data based on familyId
  const {
    data: childData,
    isLoading: isChildLoading,
    error: childError,
  } = useFetchChildren(familyId);

  // Consolidate loading and error states
  const isLoading = isFamilyLoading || isParentLoading || isChildLoading;
  const error = familyError || parentError || childError;

  return {
    userId,
    familyId,
    familyData,
    parentData,
    childData,
    isLoading,
    error,
  };
};

export const useInviteFamilyMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ email, inviterId, inviterEmail }) =>
      inviteFamilyMember({ email }, inviterId, inviterEmail),

    onSuccess: () => {
      // Invalidate and refetch any relevant queries
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast({
        title: "Invitation successfully sent",
      });
    },

    onError: (error) => {
      console.error("Error sending invitation:", error);
      toast({
        title: "Failed to send invitation",
        variant: "destructive",
      });
    },
  });
};

export const useAcceptInvitation = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (token) => acceptFamilyInvitation(token),

    onSuccess: () => {
      toast({ title: "Invitation accepted" });
      navigate("/dashboard");
    },

    onError: (error) => {
      console.error("Error accepting invitation:", error);
      toast({ title: "Error accepting invitation", variant: "destructive" });
      navigate("/");
    },
  });
};
