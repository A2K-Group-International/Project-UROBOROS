import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import CommentDate from "./CommentDate";
import { ReplyIcon, KebabIcon } from "@/assets/icons/icons";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import ReplyInput from "./ReplyInput";
import { cn, getInitial } from "@/lib/utils";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import EditReplyForm from "./EditReplyForm";
import PropTypes from "prop-types";
import { useUser } from "@/context/useUser";
import { useEffect, useState } from "react";
import TriggerLikeIcon from "./TriggerLikeIcon";
import { useSearchParams } from "react-router-dom";
import AutoLinkText from "@/lib/AutoLinkText";
import ImageLoader from "@/lib/ImageLoader";

const Replies = ({
  reply,
  showReply,
  commentId,
  announcement_id,
  handleDeleteReply,
  addReplyMutation,
  setShowReply,
}) => {
  const { userData } = useUser();
  const [params] = useSearchParams();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditting, setEditting] = useState(false);

  useEffect(() => {
    if (params.get("commentId")) {
      setShowReply(true);
    }
  }, [params, reply.id, setShowReply]);

  return (
    <div
      id={`comment-${reply.id}`}
      key={reply.id}
      className={cn(
        "flex flex-col gap-2 overflow-hidden pb-3 text-xs transition-all duration-500",
        {
          flex: showReply || params.get("commentId") === reply.id,
          hidden: !showReply,
        }
      )}
    >
      <div className="flex items-start gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={reply?.users?.user_image ?? ""}
            alt="profile picture"
          />
          <AvatarFallback className="bg-primary">
            {getInitial(reply?.users?.first_name)}
          </AvatarFallback>
        </Avatar>

        {isEditting ? (
          <EditReplyForm
            announcement_id={announcement_id}
            comment_id={reply.id}
            InputDefaultFile={reply.file_url}
            file_name={reply.file_name}
            file_type={reply.file_type}
            setEditting={setEditting}
            InputDefaultValue={reply.comment_content}
          />
        ) : (
          <div
            className={cn(
              "relative flex-grow rounded-3xl bg-primary px-5 py-4",
              {
                "border border-accent":
                  params.get("commentId") === String(reply.id),
              }
            )}
          >
            <div className="flex flex-grow justify-between">
              <div className="flex flex-col">
                <p className="font-bold text-accent">{`${reply?.users?.first_name} ${reply?.users?.last_name}`}</p>
                <div className="flex gap-1">
                  <CommentDate
                    date={reply.created_at}
                    isEdited={reply.edited}
                    InputDefaultValue={reply.comment_content}
                  />
                </div>
              </div>
              <div className="flex">
                {userData?.id === reply?.users?.id && (
                  <Popover>
                    <PopoverTrigger>
                      {/* <img src={kebab} alt="kebab icon" /> */}
                      <KebabIcon className="h-5 w-5 text-accent" />
                    </PopoverTrigger>
                    <PopoverContent
                      align="center"
                      className="w-fit overflow-hidden p-0 outline-none"
                    >
                      <Button
                        onClick={() => setEditting(true)}
                        className="w-full p-3 text-center hover:cursor-pointer"
                        variant={"ghost"}
                      >
                        Edit
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full rounded-none text-center hover:cursor-pointer"
                            variant={"ghost"}
                          >
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] sm:rounded-3xl">
                          <DialogHeader>
                            <DialogTitle>Delete Comment</DialogTitle>
                            <DialogDescription>
                              Delete Your Comment Permanently
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl text-accent hover:text-accent"
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                onClick={() => handleDeleteReply(reply.id)}
                                variant={"destructive"}
                                type="submit"
                                className="rounded-xl"
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
            <div>
              <AutoLinkText
                className="break-word text-md block whitespace-pre-wrap text-start text-sm leading-5 text-accent"
                text={reply.comment_content}
              />
              {reply?.file_url && reply?.file_type?.startsWith("image") && (
                <div className="mt-2">
                  <ImageLoader
                    src={reply?.file_url}
                    alt="Comment Attachment"
                    className="max-h-96 w-fit rounded-md object-cover"
                  />
                </div>
              )}
              {reply?.file_url && reply?.file_type?.startsWith("video") && (
                <video
                  className="mt-2 max-h-96 w-fit rounded-md object-cover"
                  src={reply?.file_url}
                  controls
                  alt="Comment Attachment"
                />
              )}
              <div className="flex items-center">
                {/* <TriggerDislikeIcon
                  className="absolute -bottom-4 right-2 w-14 rounded-3xl bg-white p-1"
                  comment_id={reply.id}
                  user_id={userData?.id}
                  columnName="comment_id"
                /> */}
                <TriggerLikeIcon
                  className="absolute -bottom-4 right-8 w-14 rounded-3xl bg-white p-1"
                  comment_id={reply.id}
                  user_id={userData?.id}
                  columnName="comment_id"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <ReplyInput
        replyTo={`${reply.users.first_name} ${reply.users.last_name}`}
        setEditting={setEditting}
        comment_id={commentId}
        isReplying={isReplying}
        setIsReplying={setIsReplying}
        announcement_id={announcement_id}
        addReplyMutation={addReplyMutation}
      />
    </div>
  );
};

Replies.propTypes = {
  reply: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    comment_content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    edited: PropTypes.bool.isRequired,
    file_url: PropTypes.string,
    file_name: PropTypes.string,
    file_type: PropTypes.string,
    users: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      user_image: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    }).isRequired,
  }).isRequired,
  showReply: PropTypes.bool.isRequired,
  commentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  handleUpdateReply: PropTypes.func.isRequired,
  handleDeleteReply: PropTypes.func.isRequired,
  addReplyMutation: PropTypes.object.isRequired,
  setShowReply: PropTypes.func.isRequired,
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default Replies;
