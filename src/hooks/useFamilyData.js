import { useUser } from "@/context/useUser";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchChildren,
  useFetchFamilyId,
  useFetchGuardian,
} from "@/hooks/useFamily";
import { inviteFamilyMember } from "@/services/familyService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
