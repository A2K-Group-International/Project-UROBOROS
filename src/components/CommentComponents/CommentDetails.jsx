import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import PropTypes from "prop-types";
import { KebabIcon } from "@/assets/icons/icons";

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

import EditCommentForm from "./EditCommentForm";

import useComment from "@/hooks/useComment";
import { useUser } from "@/context/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TriggerLikeIcon from "./TriggerLikeIcon";
import AutoLinkText from "@/lib/AutoLinkText";

const CommentDetails = ({
  announcement_id,
  comment,
  columnName,
  highlighted,
}) => {
  const { userData } = useUser();
  const [isEditting, setEditting] = useState(false);
  const { handleDeleteComment } = useComment(announcement_id);

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
              "relative rounded-3xl bg-primary px-5 pb-5 pt-3",
              highlighted && "border border-accent"
            )}
          >
            <div className="flex flex-shrink items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-accent opacity-80">{`${comment.users?.first_name} ${comment.users?.last_name}`}</p>
                <CommentDate
                  date={comment?.created_at}
                  isEdited={comment?.edited}
                />
              </div>
              <div>
                {(userData?.id === comment.users?.id ||
                  userData.role === "admin") && (
                  <Popover>
                    <PopoverTrigger>
                      <KebabIcon className="h-5 w-5 text-accent" />
                    </PopoverTrigger>
                    <PopoverContent className="flex w-28 flex-col overflow-hidden p-0">
                      {userData?.id === comment.users?.id && (
                        <Button
                          onClick={() => setEditting(true)}
                          className="w-full rounded-none"
                          variant={"outline"}
                        >
                          Edit
                        </Button>
                      )}
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
                              Delete this comment permanently
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose className="flex" asChild>
                              <Button
                                // onClick={}
                                className="flex-1 rounded-xl text-accent hover:text-accent"
                                type="button"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                className="flex-1 rounded-xl"
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
              </div>
            </div>
            <AutoLinkText
              className="break-word block whitespace-pre-wrap text-start text-sm leading-5 text-accent"
              text={comment.content}
            />

            <div className="flex items-center">
              <TriggerLikeIcon
                className="absolute -bottom-4 right-8 w-14 rounded-3xl bg-white p-1"
                comment_id={comment.id}
                user_id={userData?.id}
                columnName={columnName}
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
            InputDefaultValue={comment.content}
            announcement_id={announcement_id}
            // handleUpdateComment={handleUpdateComment}
          />
        )}
      </div>
    </div>
  );
};

CommentDetails.propTypes = {
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    edited: PropTypes.bool,

    users: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      user_image: PropTypes.string,
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  columnName: PropTypes.string.isRequired,
  highlighted: PropTypes.bool,
};

export default CommentDetails;
