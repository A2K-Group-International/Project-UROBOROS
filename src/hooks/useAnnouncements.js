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

  // Create a unique query key that includes both group_id and subgroup_id.
  // The ids arrive in two shapes: an omitted prop is undefined, while
  // searchParams.get() returns null. React Query compares keys structurally and
  // does not treat those as equal, so normalise before they reach the key or
  // the same feed ends up cached under two different entries.
  const queryKey = ["announcements", group_id ?? null, subgroup_id ?? null];

  // Mutations invalidate every announcement feed rather than just this hook's
  // own key. AnnouncementForm builds its own useAnnouncements instance from URL
  // params, but the edit form is rendered by Announcement.jsx without the group
  // ids, so its key does not match the list that rendered the post and an exact
  // invalidation silently matches nothing.
  const invalidateAllFeeds = () =>
    queryClient.invalidateQueries({ queryKey: ["announcements"] });

  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const response = await fetchAnnouncementsV2(
        pageParam,
        5,
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

    onSettled: invalidateAllFeeds,
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
    onSettled: invalidateAllFeeds,
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
    onSettled: invalidateAllFeeds,
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
