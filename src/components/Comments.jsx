import { useUser } from "@/context/useUser";
import { getInitial } from "@/lib/utils";
import CommentInput from "./CommentComponents/CommentInput";
import useComment from "@/hooks/useComment";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CommentDetails from "./CommentComponents/CommentDetails";
import PropTypes from "prop-types";
import useInterObserver from "@/hooks/useInterObserver";
import { memo } from "react";

const Comments = ({ announcement_id, isModal }) => {
  const { userData } = useUser();
  const Initial = getInitial(userData?.first_name);
  const {
    HandleAddComment,
    commentData,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useComment(announcement_id, null);

  const { ref } = useInterObserver(fetchNextPage);

  return (
    <div className="">
      <h1 className="text-md mb-2 font-bold text-accent">
        {commentData?.pages[0]?.totalItems} Comments
      </h1>
      <div className="no-scrollbar max-h-52 overflow-y-scroll">
        {!isLoading ? (
          <div>
            {commentData?.pages.flatMap((page) =>
              page.items.map((comment) => (
                <CommentDetails
                  key={comment.id}
                  comment={comment}
                  announcement_id={announcement_id}
                  columnName="comment_id"
                />
              ))
            )}
            {hasNextPage && <div className="h-2" ref={ref}></div>}
          </div>
        ) : (
          <p>loading...</p>
        )}
      </div>

      <div className="flex w-full items-start justify-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={""} alt="@shadcn" />
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

Comments.defaultProps = {
  isModal: false,
};

export default memo(Comments);
