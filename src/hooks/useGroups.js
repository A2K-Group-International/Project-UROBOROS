import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGroup,
  editGroup,
  fetchGroups,
  fetchGroupMembers,
  removeMember,
  addMember,
  deleteGroup,
  transferUserToGroup,
} from "@/services/groupServices";
import { toast } from "./use-toast";

const useGroups = ({ ministryId, groupId }) => {
  const queryClient = useQueryClient();

  const groups = useQuery({
    queryKey: ["groups", ministryId],
    queryFn: async () => await fetchGroups(ministryId),
    enabled: !!ministryId,
  });

  const groupmembers = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: async () => await fetchGroupMembers(groupId),
    enabled: !!groupId,
  });

  const addGroupMembersMutation = useMutation({
    mutationFn: ({ groupId, members }) => addMember({ groupId, members }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Members added successfully",
      });
    },
    onError: (error) => {
      console.error("Error in addGroupMembersMutation:", error);
      toast({
        title: "Error",
        description: error.message || "Error adding members",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });
  const removeGroupMembersMutation = useMutation({
    mutationFn: ({ userId, groupId }) => removeMember({ userId, groupId }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error removing member",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error creating group",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["groups", ministryId]);
    },
  });

  const editGroupMutation = useMutation({
    mutationFn: editGroup,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group edited successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error editting group",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["groups", ministryId]);
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteGroup,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error deleting group",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["groups", ministryId]);
    },
  });

  const transferUserToGroupMutation = useMutation({
    mutationFn: transferUserToGroup,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member transferred successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error transferring member",
        variant: "destructive",
      });
    },
    onSettled: (data, error, variables) => {
      // Invalidate queries for both the source and destination groups
      queryClient.invalidateQueries(["groupMembers", variables.currentGroupId]);
      queryClient.invalidateQueries(["groupMembers", variables.newGroupId]);
    },
  });

  return {
    deleteGroupMutation,
    editGroupMutation,
    createGroupMutation,
    groups,
    groupmembers,
    addGroupMembersMutation,
    removeGroupMembersMutation,
    transferUserToGroupMutation,
  };
};

export default useGroups;
