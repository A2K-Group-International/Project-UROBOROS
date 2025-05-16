import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "@/services/commentsService";
import { useToast } from "./use-toast";

const useComment = (announcement_id, comment_id) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: (_, { reset, setIsCommenting }) => {
      reset();
      setIsCommenting(false);
    },
    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
    },
  });
  const {
    data: commentData,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["comments", announcement_id],
    staleTime: 1000 * 60 * 5, // 5 minutes - makes data fresh for longer
    cacheTime: 1000 * 60 * 10, // How long to keep inactive data
    refetchOnWindowFocus: false, // Crucial for preventing pinned comment from disappearing on tab switch
    refetchOnMount: false, // May prevent reset if component remounts
    refetchOnReconnect: false,
    queryFn: async ({ pageParam }) => {
      const response = await fetchComments(pageParam, 10, announcement_id);
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return lastPage.currentPage + 1;
      }
    },

    enabled: !!announcement_id,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,

    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["replies", comment_id],
      });
    },
  });
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,

    onError: (error) => {
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
    },
  });

  // const HandleAddComment = (
  //   data,
  //   user_id,
  //   post_id,
  //   columnName,
  //   setIsCommenting,
  //   reset
  // ) => {
  //   addCommentMutation.mutate({
  //     comment: data[`comment${post_id}`],
  //     user_id,
  //     announcement_id,
  //     columnName,
  //     setIsCommenting,
  //     reset,
  //   });
  // };

  const handleDeleteComment = (comment_id) => {
    deleteCommentMutation.mutate(comment_id);
  };

  const handleUpdateComment = (inputs, comment_id, setEditting) => {
    updateCommentMutation.mutate(
      { comment: inputs.comment, comment_id },
      {
        onSuccess: () => {
          setEditting(false);
        },
      }
    );
  };

  return {
    handleDeleteComment,
    handleUpdateComment,
    // HandleAddComment,
    isError,
    isLoading,
    commentData,
    hasNextPage,
    fetchNextPage,
    isFetching,
    addCommentMutation,
    refetch,
  };
};

export default useComment;
