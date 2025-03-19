import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import {
  createMinistry,
  getAllMinistries,
  deleteMinistry,
  removeMinistryVolunteer,
  fetchMinistryAssignedUsers,
  assignNewVolunteers,
  getMinistryCoordinators,
  editMinistry,
  // getAssignedMinistries,
} from "@/services/ministryService";
// import { ROLES } from "@/constants/roles";

const useMinistry = ({ ministryId }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch ministry members
  const {
    data: ministryMembers,
    error,
    isLoading: membersLoading,
  } = useQuery({
    queryKey: ["ministryMembers", ministryId],
    queryFn: () => fetchMinistryAssignedUsers(ministryId),
    enabled: !!ministryId,
  });

  const { data: ministries, isLoading: ministryLoading } = useQuery({
    queryKey: ["ministries"],
    queryFn: async () => {
      return getAllMinistries();
    },
  });

  const coordinators = useQuery({
    queryKey: ["ministryCoordinators", ministryId],
    queryFn: async () => getMinistryCoordinators(ministryId),
    enabled: !!ministryId,
  });

  // Mutation for creating a ministry
  const createMutation = useMutation({
    mutationFn: createMinistry,
    onSuccess: () => {
      queryClient.invalidateQueries(["ministries"]);
      toast({
        title: "Ministry Created",
        description: "Ministry has been created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Creating Ministry",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create the edit mutation
  const updateMinistryMutation = useMutation({
    mutationFn: editMinistry,
    onSuccess: () => {
      queryClient.invalidateQueries(["ministries", ministryId]);
      toast({
        title: "Ministry Updated",
        description: "Ministry has been updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating Ministry",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a ministry
  const deleteMutation = useMutation({
    mutationFn: deleteMinistry,
    onSuccess: () => {
      queryClient.invalidateQueries(["ministries"]);
      toast({
        title: "Ministry Deleted",
        description: "Ministry has been deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Ministry",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mutation for removing a ministry volunteer
  const removeMinistryVolunteerMutation = useMutation({
    mutationFn: ({ ministryId, memberId }) =>
      removeMinistryVolunteer(ministryId, memberId),
    onSuccess: () => {
      toast({
        title: "Member Removed",
        description: "The member has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Removing Member",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["ministryMembers", ministryId]);
    },
  });

  const AssignMinistryVolunteerMutation = useMutation({
    mutationFn: ({ ministryId, newMembers }) =>
      assignNewVolunteers(ministryId, newMembers),
    onSuccess: () => {
      queryClient.invalidateQueries(["ministries"]);
      queryClient.invalidateQueries(["ministryMembers"]);
    },
    onError: (error) => {
      console.error("Error while assigning volunteers:", error.message);
    },
  });

  return {
    AssignMinistryVolunteerMutation,
    ministryLoading,
    ministryMembers,
    ministries,
    membersLoading,
    error,
    coordinators,
    createMutation,
    updateMinistryMutation,
    deleteMutation,
    removeMinistryVolunteerMutation,
  };
};

export default useMinistry;
