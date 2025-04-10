import {
  createAnnouncements,
  deleteAnnouncement,
  editAnnouncement,
  fetchAnnouncementsV2,
} from "@/services/AnnouncementsService";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "./use-toast";

const useAnnouncements = ({ group_id, subgroup_id }) => {
  const queryClient = useQueryClient();

  // Create a unique query key that includes both group_id and subgroup_id
  const queryKey = ["announcements", { group_id, subgroup_id }];

  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await fetchAnnouncementsV2(
        pageParam,
        10,
        group_id,
        subgroup_id
      );
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return lastPage.currentPage + 1;
      }
    },
  });

  const addAnnouncementMutation = useMutation({
    mutationFn: createAnnouncements,

    onSuccess: () => {
      toast({
        title: "Success",
        description: "Announcement created.",
      });
      // Invalidate the query with both parameters
      queryClient.invalidateQueries({ queryKey });
    },

    onError: (error, context) => {
      // Rollback the cache to its previous state in case of an error
      queryClient.setQueryData(
        ["announcements", group_id],
        context.previousAnnouncements
      );
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["announcements", group_id],
      });
    },
  });

  const editAnnouncementMutation = useMutation({
    mutationFn: editAnnouncement,
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Announcement edited`,
      });
    },
    onError: (error, context) => {
      queryClient.setQueryData(
        ["announcements", group_id],
        context.previousAnnouncements
      );
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementData) =>
      await deleteAnnouncement(announcementData),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Announcement deleted`,
      });
    },
    onError: (error, context) => {
      queryClient.setQueryData(
        ["announcements", group_id],
        context.previousAnnouncements
      );
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    addAnnouncementMutation,
    deleteAnnouncementMutation,
    editAnnouncementMutation,
  };
};

export default useAnnouncements;
