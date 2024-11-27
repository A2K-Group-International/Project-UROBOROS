import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import PropTypes from "prop-types";
import { ReplyIcon, KebabIcon} from "@/assets/icons/icons";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { getInitial } from "@/lib/utils";
import CommentDate from "./CommentDate";
import ReplyInput from "./ReplyInput";
// import kebab from "@/assets/svg/threeDots.svg";

import EditCommentForm from "./EditCommentForm";

import SetShowReplyButton from "./SetShowReplyButton";

import useReply from "@/hooks/useReply";
import useComment from "@/hooks/useComment";
import { useUser } from "@/context/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Replies from "./Replies";
import TriggerLikeIcon from "./TriggerLikeIcon";
import TriggerDislikeIcon from "./TriggerDislikeIcon";
 const CommentDetails = ({
  announcement_id,
  comment,
  columnName,
}) => {
  const { userData } = useUser();
  const [isReplying, setIsReplying] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [isEditting, setEditting] = useState(false);
  const { handleDeleteComment, handleUpdateComment } = useComment(
    announcement_id,
    comment.id,
    columnName
  );
  const {
    data,
    isLoading,
    handleUpdateReply,
    handleDeleteReply,
    handleAddReply,
  } = useReply(comment.id, showReply, announcement_id);

  return (
    <div className="mt-2 flex items-start gap-2">
      <div className="flex">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.users?.user_image ?? ""}
            alt="profile picture"
          />
          <AvatarFallback className="h-8 w-8 rounded-full bg-green-600 p-2">
            {getInitial(comment.users.first_name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        {!isEditting ? (
          <div className="tems-center relative flex flex-col justify-between rounded-3xl bg-primary px-5 py-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-accent opacity-80">{`${comment.users.first_name} ${comment.users.last_name}`}</p>
                <CommentDate
                  date={comment.created_at}
                  isEdited={comment.edited}
                />
              </div>
              <div></div>
            </div>
            <div className="text-accent">{comment.comment_content}</div>
            <div className="flex items-center">
             
                <TriggerLikeIcon
                  className="absolute -bottom-4 right-16 w-14 rounded-3xl bg-white p-1"
                  comment_id={comment.id}
                  user_id={userData?.id}
                  columnName={"comment_id"}
                />
          
                <TriggerDislikeIcon
                  className="absolute -bottom-4 right-2 w-14 rounded-3xl bg-white p-1"
                  comment_id={comment.id}
                  user_id={userData?.id}
                  columnName={"comment_id"}
                />
            </div>
          </div>
        ) : (
          <EditCommentForm
            comment_id={comment.id}
            setEditting={setEditting}
            InputDefaultValue={comment.comment_content}
            handleUpdateComment={handleUpdateComment}
          />
        )}
        <ReplyInput
          setEditting={setEditting}
          announcement_id={announcement_id}
          comment_id={comment.id}
          isReplying={isReplying}
          setIsReplying={setIsReplying}
          handleAddReply={handleAddReply}
          // replyTo={`${comment.users.first_name} ${comment.users.last_name}`}
        />
        {comment?.reply_count > 0 && (
          <SetShowReplyButton
            replyCount={comment?.reply_count}
            setShowReply={setShowReply}
            showReply={showReply}
          />
        )}
        <div className="flex flex-col">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            data?.map((reply, index) => (
              <Replies
                key={index}
                commentId={comment.id}
                announcement_id={announcement_id}
                showReply={showReply}
                isEditting={isEditting}
                setEditting={setEditting}
                reply={reply}
                handleDeleteReply={handleDeleteReply}
                handleUpdateReply={handleUpdateReply}
                handleAddReply={handleAddReply}
              />
            ))
          )}
        </div>
      </div>
      {userData?.id === comment.users.id && (
        <Popover>
          <PopoverTrigger>
            <KebabIcon className="h-5 w-5" />
          </PopoverTrigger>
          <PopoverContent className="flex w-28 flex-col overflow-hidden rounded-2xl p-0">
            <Button
              onClick={() => setEditting(true)}
              className="w-full rounded-none"
              variant={"outline"}
            >
              Edit
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full rounded-none" variant={"destructive"}>
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] sm:rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="font-bold text-accent">
                    Delete Comment
                  </DialogTitle>
                  <DialogDescription className="text-accent opacity-80">
                    Delete Your Comment Permanently
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      // onClick={}
                      className="rounded-xl"
                      type="button"
                      variant="default"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      className="rounded-xl"
                      onClick={() => handleDeleteComment(comment.id)}
                      variant={"destructive"}
                      type="submit"
                    >
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PopoverContent>
        </Popover>
      )}
      <button onClick={() => setIsReplying(true)} className="ml-2 rounded-2xl">
      <ReplyIcon className="w-5 h-5 hover:cursor-pointer"/>

      </button>
    </div>
  );
}

CommentDetails.propTypes = {
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  comment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    comment_content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    edited: PropTypes.bool.isRequired,
    users: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      user_image: PropTypes.string,
      id: PropTypes.number.isRequired,
    }).isRequired,
    reply_count: PropTypes.number.isRequired,
  }).isRequired,
  columnName: PropTypes.string.isRequired,
};

export default CommentDetails