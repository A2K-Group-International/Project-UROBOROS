import { useUser } from "@/context/useUser";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import PropTypes from "prop-types";
import useComment from "@/hooks/useComment";
import { Icon } from "@iconify/react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import ImageLoader from "@/lib/ImageLoader";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import EmojiPicker from "emoji-picker-react";

const CommentInput = ({ announcement_id, isModal }) => {
  const { register, handleSubmit, reset, setValue, watch, getValues } =
    useForm();
  const { userData } = useUser();
  const [isCommenting, setIsCommenting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { addCommentMutation } = useComment(announcement_id, null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // Create a unique input name for modal vs non-modal
  const inputName = isModal
    ? `modal_comment${announcement_id}`
    : `comment${announcement_id}`;

  const inputFile = isModal
    ? `modal_file${announcement_id}`
    : `file${announcement_id}`;

  const currentText = watch(inputName) || "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiClick = (emojiData) => {
    const currentValue = currentText;
    const cursorPosition =
      textareaRef.current?.selectionStart || currentValue.length;
    const newText =
      currentValue.slice(0, cursorPosition) +
      emojiData.emoji +
      currentValue.slice(cursorPosition);

    setValue(inputName, newText);
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

  return (
    <div className="mt-2 flex-grow">
      <form
        onSubmit={handleSubmit((data) => {
          const fileData = data[inputFile];
          const actualFile =
            fileData && fileData.length > 0 ? fileData[0] : null;

          addCommentMutation.mutate(
            {
              comment: data[inputName],
              user_id: userData.id,
              file: actualFile,
              announcement_id,
              reset,
              setIsCommenting,
            },
            {
              onSuccess: () => {
                setFilePreview(null);
                setPreviewType(null);
                setIsCommenting(false);
                setShowEmojiPicker(false);
              },
            }
          );
        })}
        id={inputName}
        className="flex-1"
      >
        <Textarea
          ref={textareaRef}
          className="resize-none rounded-2xl border-accent/30 bg-white md:bg-primary"
          {...register(inputName, { required: true })}
          onFocus={() => setIsCommenting(true)}
          name={inputName}
          placeholder="Write a comment..."
        />
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
            onChange: (e) => {
              const file = e.target.files[0];
              const type = file ? file.type.split("/")[0] : null;
              setPreviewType(type);
              if (file) {
                setFilePreview(URL.createObjectURL(file));
              } else {
                setFilePreview(null);
              }
            },
          })}
        />
      </form>

      {isCommenting && (
        <div className="mt-2 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-2">
            {!filePreview ? (
              <Tooltip>
                <TooltipTrigger>
                  <Label
                    htmlFor={inputFile}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-primary"
                  >
                    <Icon className="h-5 w-5" icon={"mingcute:camera-2-line"} />
                  </Label>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                  Attach a video or photo
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="relative">
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

            {/* Emoji Picker Button */}
            <div className="relative" ref={emojiPickerRef}>
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

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    autoFocusSearch={false}
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
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => {
                setIsCommenting(false);
                setShowEmojiPicker(false);
              }}
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button
              disabled={addCommentMutation.isPending || !getValues(inputName)}
              type="submit"
              form={inputName}
              className="bg-accent"
            >
              {addCommentMutation.isPending ? "Commenting..." : "Comment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

CommentInput.propTypes = {
  announcement_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  isModal: PropTypes.bool,
};

export default CommentInput;
