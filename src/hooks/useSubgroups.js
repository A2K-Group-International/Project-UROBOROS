import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSubgroup,
  addSubgroupMembers,
  removeSubgroupMember,
  fetchSubgroupMembers,
} from "@/services/subgroupServices";

const useSubgroups = ({ subgroupId }) => {
  const queryClient = useQueryClient();

  // Get a single subgroup details
  const subgroup = useQuery({
    queryKey: ["subgroup", subgroupId],
    queryFn: () => fetchSubgroup(subgroupId),
    enabled: !!subgroupId,
  });

  // Add proper logging to diagnose the issue

  // Get members of a subgroup with proper logging
  const subgroupmembers = useQuery({
    queryKey: ["subgroup-members", subgroupId],
    queryFn: async () => {
      const data = await fetchSubgroupMembers(subgroupId);
      return data;
    },
    enabled: !!subgroupId,
  });

  // Add members to a subgroup
  const addSubgroupMembersMutation = useMutation({
    mutationFn: ({ subgroupId, members }) => {
      return addSubgroupMembers(subgroupId, members);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["subgroup-members", subgroupId],
      });
    },
  });

  // Remove a member from a subgroup
  const removeSubgroupMembersMutation = useMutation({
    mutationFn: ({ userId, subgroupId }) => {
      return removeSubgroupMember({ userId, subgroupId });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["subgroup-members", subgroupId],
      });
    },
  });

  return {
    subgroup,
    subgroupmembers,
    addSubgroupMembersMutation,
    removeSubgroupMembersMutation,
  };
};

export default useSubgroups;
