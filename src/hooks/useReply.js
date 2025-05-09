import {
  addReply,
  deleteReply,
  fetchNestedReplies,
  updateComment,
} from "@/services/commentsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

const useReply = (commentId, showReply, announcement_id) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addReplyMutation = useMutation({
    mutationFn: addReply,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply Added.",
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
      // console.log("revalidaing", announcement_id);
      queryClient.invalidateQueries({ queryKey: ["replies", commentId] });
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
    },
  });
  const deleteReplyMutation = useMutation({
    mutationFn: deleteReply,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply Deleted.",
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
      // console.log("revalidaing", announcement_id);
      queryClient.invalidateQueries({ queryKey: ["replies", commentId] });
      queryClient.invalidateQueries({
        queryKey: ["comments", announcement_id],
      });
    },
  });
  const updateReplyMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment Updated.",
      });

      //   reset()
    },
    onError: (error) => {
      // console.error("Mutation error:", error);
      toast({
        title: "Something went wrong",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      // console.log("before invalidating", commentId);
      queryClient.invalidateQueries({
        queryKey: ["replies", commentId],
      });

      // const cached = queryClient.getQueryCache();
      // const keys = cached
      //   .getAll()
      //   .map((query) => ({ key: query.queryKey, value: query.state.data }));
      // console.log(keys);
    },
  });

  // const handleAddReply = (inputs, user_id, comment_id, setEditting, reset,setIsReplying) => {
  //   addReplyMutation.mutate(
  //     {
  //       reply: inputs.reply,
  //       user_id,
  //       comment_id,
  //       setIsReplying,
  //       reset,
  //       setEditting,
  //     },
  //     {
  //       onSuccess: () => {
  //         reset();
  //         setEditting(false);
  //         setIsReplying(false)
  //       },
  //     },
  //   );
  // };
  const handleDeleteReply = (comment_id) => {
    deleteReplyMutation.mutate(comment_id);
  };

  const handleUpdateReply = (inputs, comment_id, setEditting) => {
    // console.log("comment_ID",inputs,comment_id)
    updateReplyMutation.mutate(
      { comment: inputs.comment, comment_id, setEditting },
      {
        onSuccess: () => {
          setEditting(false);
        },
      }
    );
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["replies", commentId],
    queryFn: async () => await fetchNestedReplies(commentId),
    enabled: showReply,
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  return {
    handleDeleteReply,
    handleUpdateReply,
    data,
    isLoading,
    isError,
    addReplyMutation,
  };
};
export default useReply;
