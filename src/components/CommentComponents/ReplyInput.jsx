import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { useUser } from "@/context/useUser";
import PropTypes from "prop-types";
import { Textarea } from "../ui/textarea";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ImageLoader from "@/lib/ImageLoader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import EmojiPicker from "emoji-picker-react";

const ReplyInput = ({
  comment_id,
  isReplying,
  setIsReplying,
  setEditting,
  addReplyMutation,
  announcement_id,
}) => {
  const { userData } = useUser();
  const { register, reset, handleSubmit, setValue, watch } = useForm();
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputFile = `reply_file_${comment_id}`;
  const currentText = watch("reply") || "";

  const handleEmojiClick = (emojiData) => {
    const currentValue = currentText;
    const cursorPosition =
      textareaRef.current?.selectionStart || currentValue.length;
    const newText =
      currentValue.slice(0, cursorPosition) +
      emojiData.emoji +
      currentValue.slice(cursorPosition);

    setValue("reply", newText);
    setShowEmojiPicker(false);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        cursorPosition + emojiData.emoji.length,
        cursorPosition + emojiData.emoji.length
      );
    }, 0);
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setValue(inputFile, null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const type = file.type.split("/")[0];
      setPreviewType(type);
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
      setPreviewType(null);
    }
  };

  return (
    <div className="mr-2 mt-5 flex flex-col gap-2">
      {isReplying && (
        <form
          onSubmit={handleSubmit((inputs) => {
            const fileData = inputs[inputFile];
            const actualFile =
              fileData && fileData.length > 0 ? fileData[0] : null;
            addReplyMutation.mutate(
              {
                reply: inputs.reply,
                user_id: userData.id,
                comment_id,
                announcement_id,
                file: actualFile,
              },
              {
                onSuccess: () => {
                  setIsReplying(false);
                  setEditting(false);
                  reset();
                  setFilePreview(null);
                  setPreviewType(null);
                  setShowEmojiPicker(false);
                },
              }
            );
          })}
          className="flex"
        >
          <div className="flex flex-grow flex-col gap-2">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  className=""
                  src={userData?.user_image ?? ""}
                  alt="user image"
                />
                <AvatarFallback className="bg-accent text-white">
                  {getInitial(userData?.first_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex w-full flex-col gap-2">
                <Textarea
                  ref={textareaRef}
                  {...register("reply", { required: true })}
                  name="reply"
                  placeholder="type your reply here"
                ></Textarea>
                {filePreview && (
                  <div className="relative w-fit">
                    {previewType === "video" ? (
                      <video
                        className="h-28 w-fit rounded-md border border-accent object-contain"
                        src={filePreview}
                        controls={true}
                        alt="Preview"
                      />
                    ) : (
                      <ImageLoader
                        className="h-28 w-28 rounded-md border border-accent"
                        src={filePreview}
                        alt="Preview"
                      />
                    )}
                    <Icon
                      onClick={handleRemoveFile}
                      className="absolute right-1 top-1 text-xl text-accent hover:cursor-pointer"
                      icon={"mingcute:close-circle-fill"}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="relative flex items-center gap-2">
                {!filePreview && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor={inputFile}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-primary"
                      >
                        <Icon
                          className="h-5 w-5"
                          icon={"mingcute:camera-2-line"}
                        />
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      Attach a video or photo
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-primary"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Icon
                        className="h-5 w-5 text-accent"
                        icon={"mingcute:emoji-line"}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Add emoji</TooltipContent>
                </Tooltip>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-50">
                    <EmojiPicker
                      autoFocusSearch={false}
                      onEmojiClick={handleEmojiClick}
                      width={300}
                      height={400}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      previewConfig={{
                        showPreview: false,
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setShowEmojiPicker(false);
                  }}
                  variant={"outline"}
                >
                  Cancel
                </Button>
                <Button
                  disabled={addReplyMutation.isPending}
                  type="submit"
                  className="bg-accent"
                >
                  {addReplyMutation.isPending ? "Replying..." : "Reply"}
                </Button>
              </div>
            </div>
          </div>
          <Input
            ref={inputRef}
            className="hidden"
            id={inputFile}
            name={inputFile}
            type="file"
            accept="image/*, video/*"
            multiple={false}
            {...register(inputFile, {
              required: false,
              onChange: handleFileChange,
            })}
          />
        </form>
      )}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};
ReplyInput.propTypes = {
  comment_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isReplying: PropTypes.bool.isRequired,
  setIsReplying: PropTypes.func.isRequired,
  setEditting: PropTypes.func.isRequired,
  replyTo: PropTypes.string,
  addReplyMutation: PropTypes.object,
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export default ReplyInput;
