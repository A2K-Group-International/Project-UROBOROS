import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: (data, { reset, setIsCommenting }) => {
      toast({
        title: "Success",
        description: "Comment Added.",
      });
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
    isLoading,
  } = useQuery({
    queryKey: ["comments", announcement_id],
    queryFn: async () => await fetchComments(announcement_id),
    enabled: !!announcement_id,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment Deleted.",
      });
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
      queryClient.invalidateQueries({
        queryKey: ["replies", comment_id],
      });
    },
  });
  const updateCommentMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment Updated.",
      });
    },
    onError: (error) => {
      // console.error("Mutation error:", error);
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

  const HandleAddComment = (
    data,
    user_id,
    post_id,
    columnName,
    setIsCommenting,
    reset
  ) => {
    addCommentMutation.mutate({
      comment: data[`comment${post_id}`],
      user_id,
      announcement_id,
      columnName,
      setIsCommenting,
      reset,
    });
  };

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
    HandleAddComment,
    isError,
    isLoading,
    commentData,
  };
};

export default useComment;