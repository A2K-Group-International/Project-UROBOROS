import { useUser } from "@/context/useUser";
import { getInitial } from "@/lib/utils";
import CommentInput from "./CommentComponents/CommentInput";
import useComment from "@/hooks/useComment";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CommentDetails from "./CommentComponents/CommentDetails";
import PropTypes from "prop-types";
import useInterObserver from "@/hooks/useInterObserver";
import { memo, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { fetchComment } from "@/services/commentsService";

const CommentSkeleton = () => {
  return (
    <div className="mb-3 flex w-full gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-1 h-12 w-full" />
      </div>
    </div>
  );
};

const Comments = ({ announcement_id, isModal }) => {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const commentIdFromUrl = params.get("commentId");

  // State to track featured comment and comment to highlight
  const [featuredCommentId, setFeaturedCommentId] = useState(null);
  const [commentToHighlight, setCommentToHighlight] = useState(null);

  const commentRefs = useRef({});
  const initialFetchDone = useRef(false);
  const featuredCommentData = useRef(null);

  const { userData } = useUser();
  const Initial = userData?.first_name ? getInitial(userData.first_name) : "";

  // Query for the specific comment from URL
  const { data: targetCommentData, isSuccess: isTargetCommentSuccess } =
    useQuery({
      queryKey: ["comment", commentIdFromUrl],
      queryFn: () => fetchComment(commentIdFromUrl),
      enabled: !!commentIdFromUrl && isModal === true,
      staleTime: 1000 * 60 * 5, // 5 minutes - longer stale time to reduce refetches
    });

  // Query for the parent comment if needed
  const { data: parentCommentData, isSuccess: isParentCommentSuccess } =
    useQuery({
      queryKey: ["comment", targetCommentData?.parent_id],
      queryFn: () => fetchComment(targetCommentData?.parent_id),
      enabled: !!targetCommentData?.parent_id,
      staleTime: 1000 * 60 * 5,
    });

  // Main comments query
  const {
    HandleAddComment,
    commentData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
  } = useComment(announcement_id, null);

  // Function to modify query data to pin our featured comment at the top
  const pinFeaturedCommentToTop = () => {
    if (!featuredCommentId || !featuredCommentData.current) return;

    queryClient.setQueryData(["comments", announcement_id], (oldData) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0)
        return oldData;

      // Deep clone to avoid mutation issues
      const newData = JSON.parse(JSON.stringify(oldData));
      const commentToFeature = featuredCommentData.current;

      // Remove the featured comment from all pages
      newData.pages = newData.pages.map((page) => ({
        ...page,
        items:
          page.items?.filter((item) => String(item.id) !== featuredCommentId) ||
          [],
      }));

      // Add it at the very first position of the first page
      if (newData.pages[0]) {
        if (!newData.pages[0].items) {
          newData.pages[0].items = [];
        }
        newData.pages[0].items = [commentToFeature, ...newData.pages[0].items];
      }

      return newData;
    });
  };

  // Handle infinite scrolling
  const { ref: infiniteScrollRef } = useInterObserver(fetchNextPage);

  // Set up the featured comment based on the URL parameter
  useEffect(() => {
    if (!commentIdFromUrl || !isModal) {
      // Reset if there's no comment ID from URL
      setFeaturedCommentId(null);
      setCommentToHighlight(null);
      featuredCommentData.current = null;
      return;
    }

    // 1. If target comment has loaded
    if (isTargetCommentSuccess && targetCommentData) {
      // 2. If it's a reply and we need the parent
      if (targetCommentData.parent_id) {
        if (isParentCommentSuccess && parentCommentData) {
          // Set the parent as the featured comment
          setFeaturedCommentId(String(parentCommentData.id));
          setCommentToHighlight(String(commentIdFromUrl));
          featuredCommentData.current = parentCommentData;
        }
      } else {
        // Set the target comment itself as the featured comment
        setFeaturedCommentId(String(targetCommentData.id));
        setCommentToHighlight(String(targetCommentData.id));
        featuredCommentData.current = targetCommentData;
      }
    }
  }, [
    commentIdFromUrl,
    isModal,
    targetCommentData,
    parentCommentData,
    isTargetCommentSuccess,
    isParentCommentSuccess,
  ]);

  // Scroll to the highlighted comment
  useEffect(() => {
    if (!commentToHighlight || !commentRefs.current) return;

    // Add a slight delay to ensure the DOM has been updated
    const timer = setTimeout(() => {
      const element = commentRefs.current[commentToHighlight];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [commentToHighlight, commentData]);

  // When comments load or featured comment changes, pin it to the top
  useEffect(() => {
    // Only run this effect if we have both:
    // 1. A featured comment ID set
    // 2. Comment data loaded (not initial loading)
    if (featuredCommentId && commentData && !isLoading) {
      // Pin the comment to the top
      pinFeaturedCommentToTop();

      // Mark initial fetch as done
      initialFetchDone.current = true;
    }
  }, [featuredCommentId, commentData, isLoading]);

  // When data is refetched (isFetching becomes true then false)
  // we need to ensure our featured comment stays at the top
  useEffect(() => {
    if (!isFetching && initialFetchDone.current && featuredCommentId) {
      pinFeaturedCommentToTop();
    }
  }, [isFetching]);

  return (
    <div className="">
      <h1 className="text-md mb-2 font-bold text-accent">
        {commentData?.pages?.[0]?.totalItems ?? 0} Comments
      </h1>
      <div className="no-scrollbar max-h-96 overflow-y-scroll">
        {!isLoading && commentData ? (
          <div>
            {commentData.pages?.flatMap((page, pageIndex) =>
              page?.items?.map((comment) => (
                <div
                  key={`${pageIndex}-${comment.id}`}
                  ref={(el) => {
                    if (comment?.id) {
                      commentRefs.current[String(comment.id)] = el;
                    }
                  }}
                  className={`${
                    commentToHighlight === String(comment.id)
                      ? "rounded-md bg-accent/5"
                      : ""
                  }`}
                >
                  <CommentDetails
                    id={comment.id}
                    comment={comment}
                    announcement_id={announcement_id}
                    columnName="comment_id"
                    highlighted={commentToHighlight === String(comment.id)}
                  />
                </div>
              ))
            )}
            {hasNextPage && (commentData?.pages?.[0]?.totalItems ?? 0) > 0 && (
              <div className="h-2" ref={infiniteScrollRef}></div>
            )}
            {isFetching && !isLoading && <CommentSkeleton />}
          </div>
        ) : (
          <div>
            {Array.from({ length: 3 }).map((_, index) => (
              <CommentSkeleton key={index} />
            ))}
          </div>
        )}
        {!isLoading &&
          (commentData?.pages?.[0]?.totalItems === 0 ||
            !commentData?.pages ||
            commentData.pages.every(
              (p) => !p.items || p.items.length === 0
            )) && (
            <p className="text-center text-xs text-accent">
              No comments yet. Be the first to comment!
            </p>
          )}
      </div>

      <div className="flex w-full items-start justify-center gap-3 pt-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userData?.user_image || ""} alt="Profile" />
          <AvatarFallback className="bg-accent text-white">
            {Initial}
          </AvatarFallback>
        </Avatar>
        <CommentInput
          HandleAddComment={HandleAddComment}
          announcement_id={announcement_id}
          columnName="comment_id"
          isModal={isModal}
        />
      </div>
    </div>
  );
};

Comments.propTypes = {
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isModal: PropTypes.bool,
};

export default memo(Comments);
