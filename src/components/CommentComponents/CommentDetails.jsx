import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import PropTypes from "prop-types";
import { ReplyIcon, KebabIcon } from "@/assets/icons/icons";

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
import { cn, getInitial } from "@/lib/utils";
import CommentDate from "./CommentDate";
import ReplyInput from "./ReplyInput";

import EditCommentForm from "./EditCommentForm";

import SetShowReplyButton from "./SetShowReplyButton";

import useReply from "@/hooks/useReply";
import useComment from "@/hooks/useComment";
import { useUser } from "@/context/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Replies from "./Replies";
import TriggerLikeIcon from "./TriggerLikeIcon";
import { useSearchParams } from "react-router-dom";

const CommentDetails = ({
  announcement_id,
  comment,
  columnName,
  highlighted,
}) => {
  const { userData } = useUser();
  const [params] = useSearchParams();
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
    addReplyMutation,
  } = useReply(
    comment.id,
    params.get("commentId") ? true : showReply,
    announcement_id
  );

  return (
    <div className="mt-2 flex items-start gap-2">
      <div className="flex">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.users?.user_image ?? ""}
            alt="profile picture"
          />
          <AvatarFallback className="h-8 w-8 rounded-full bg-accent p-2 text-white">
            {getInitial(comment?.users?.first_name)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-grow">
        {!isEditting ? (
          <div
            className={cn(
              "relative flex flex-col justify-between rounded-3xl bg-primary px-5 pb-5 pt-3",
              highlighted && "border border-accent"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-accent opacity-80">{`${comment.users?.first_name} ${comment.users?.last_name}`}</p>
                <CommentDate
                  date={comment?.created_at}
                  isEdited={comment?.edited}
                />
              </div>
              <div>
                {userData?.id === comment.users?.id && (
                  <Popover>
                    <PopoverTrigger>
                      <KebabIcon className="h-5 w-5 text-accent" />
                    </PopoverTrigger>
                    <PopoverContent className="flex w-28 flex-col overflow-hidden p-0">
                      <Button
                        onClick={() => setEditting(true)}
                        className="w-full rounded-none"
                        variant={"outline"}
                      >
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full rounded-none"
                            variant={"ghost"}
                          >
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] sm:rounded-3xl">
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
                                className="rounded-xl text-accent hover:text-accent"
                                type="button"
                                variant="outline"
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
                <button
                  onClick={() => setIsReplying(true)}
                  className="ml-2 rounded-2xl"
                >
                  <ReplyIcon className="h-5 w-5 text-accent hover:cursor-pointer" />
                </button>
              </div>
            </div>
            <div className="break-all text-accent">
              {comment.comment_content}
            </div>

            <div className="flex items-center">
              <TriggerLikeIcon
                className="absolute -bottom-4 right-8 w-14 rounded-3xl bg-white p-1"
                comment_id={comment.id}
                user_id={userData?.id}
                columnName={"comment_id"}
              />

              {/* 
                Incase dislike id needed in the future
                <TriggerDislikeIcon
                  className="absolute -bottom-4 right-2 w-14 rounded-3xl bg-white p-1"
                  comment_id={comment.id}
                  user_id={userData?.id}
                  columnName={"comment_id"}
                /> */}
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
          addReplyMutation={addReplyMutation}
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
                setShowReply={setShowReply}
                isEditting={isEditting}
                setEditting={setEditting}
                reply={reply}
                handleDeleteReply={handleDeleteReply}
                handleUpdateReply={handleUpdateReply}
                addReplyMutation={addReplyMutation}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

CommentDetails.propTypes = {
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    comment_content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    edited: PropTypes.bool.isRequired,
    users: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      user_image: PropTypes.string,
      id: PropTypes.string.isRequired,
    }).isRequired,
    reply_count: PropTypes.number.isRequired,
  }).isRequired,
  columnName: PropTypes.string.isRequired,
  highlighted: PropTypes.bool,
};

export default CommentDetails;
