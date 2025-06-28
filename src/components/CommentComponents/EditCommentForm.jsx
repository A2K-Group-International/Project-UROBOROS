import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useEffect, useState, useRef } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Label } from "../ui/label";
import { Icon } from "@iconify/react";
import ImageLoader from "@/lib/ImageLoader";
import EmojiPicker from "emoji-picker-react";
import useComment from "@/hooks/useComment";
import { createPortal } from "react-dom";

const EditCommentForm = ({
  announcement_id,
  comment_id,
  setEditting,
  InputDefaultValue,
  InputDefaultFile,
  file_type,
  file_name,
}) => {
  const inputRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const textareaRef = useRef(null);
  const [filePreview, setFilePreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isEmojiPickerPositioned, setIsEmojiPickerPositioned] = useState(false);

  const { updateCommentMutation } = useComment(announcement_id, comment_id);

  const { register, handleSubmit, setValue, watch, getValues } = useForm({
    defaultValues: {
      comment: InputDefaultValue || "",
      file: InputDefaultFile || null,
    },
  });

  const currentText = watch("comment") || "";

  // Initialize file preview if InputDefaultFile exists
  useEffect(() => {
    if (InputDefaultValue) {
      setValue("comment", InputDefaultValue);
    }
    if (InputDefaultFile) {
      const convertUrlToFile = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new File([blob], file_name, {
          type: file_type || blob.type,
        });
      };

      const convertedFile = convertUrlToFile(InputDefaultFile);

      setValue("file", convertedFile);
      setFilePreview(InputDefaultFile ?? null);
      // Try to determine file type from URL or extension
      const isVideo = file_type?.startsWith("video");
      setPreviewType(isVideo ? "video" : "image");
    }
  }, [InputDefaultFile, InputDefaultValue, file_type, setValue, file_name]);

  useEffect(() => {
    const updatePosition = () => {
      if (emojiButtonRef.current && showEmojiPicker) {
        const rect = emojiButtonRef.current.getBoundingClientRect();
        setEmojiPickerPosition({
          top: rect.top - 410, // Position above the button (emoji picker height is ~400px)
          left: Math.max(10, rect.left - 250), // Ensure it doesn't go off-screen
        });
        setIsEmojiPickerPositioned(true);
      }
    };

    if (showEmojiPicker) {
      setIsEmojiPickerPositioned(false);
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target) &&
        !event.target.closest(".EmojiPickerReact")
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

    setValue("comment", newText);
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
    setPreviewType(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setValue("file", null);
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
    <>
      <form
        onSubmit={handleSubmit((inputs) => {
          const fileData = inputs.file;
          const actualFile =
            fileData && fileData.length > 0 ? fileData[0] : null;
          updateCommentMutation.mutate(
            {
              comment: inputs.comment,
              file: actualFile,
              comment_id,
            },
            {
              onSettled: () => {
                setEditting(false);
                setShowEmojiPicker(false);
                setFilePreview(null);
                setPreviewType(null);
              },
            }
          );
        })}
        className="mb-2 flex w-full flex-col gap-2 p-1"
      >
        <Textarea
          {...register("comment", { required: true })}
          ref={textareaRef}
          name="comment"
          value={currentText}
          onChange={(e) => setValue("comment", e.target.value)}
          placeholder="Edit your comment..."
        />
        <Input
          ref={inputRef}
          className="hidden"
          id="file"
          name="file"
          type="file"
          accept="image/*, video/*"
          multiple={false}
          {...register("file", {
            required: false,
            onChange: handleFileChange,
          })}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-2">
            {!filePreview ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="file"
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
                    className="h-28 w-28 rounded-md border border-accent object-cover"
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
            <div className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    ref={emojiButtonRef}
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
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => {
                setEditting(false);
                setShowEmojiPicker(false);
              }}
              variant={"outline"}
            >
              Cancel
            </Button>
            <Button
              disabled={
                updateCommentMutation.isPending || !getValues("comment")?.trim()
              }
              type="submit"
              className="bg-accent"
            >
              {updateCommentMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </div>
      </form>

      {/* Portal for emoji picker */}
      {showEmojiPicker &&
        createPortal(
          <div
            className="fixed z-[9999]"
            style={{
              top: `${emojiPickerPosition.top}px`,
              left: `${emojiPickerPosition.left}px`,
              opacity: isEmojiPickerPositioned ? 1 : 0,
              transition: "opacity 0.1s ease-in-out",
            }}
          >
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
          </div>,
          document.body
        )}
    </>
  );
};

EditCommentForm.propTypes = {
  announcement_id: PropTypes.string.isRequired,
  file_type: PropTypes.string.isRequired,
  file_name: PropTypes.string.isRequired,
  comment_id: PropTypes.string.isRequired,
  setEditting: PropTypes.func.isRequired,
  InputDefaultValue: PropTypes.string,
  InputDefaultFile: PropTypes.string,
};

export default EditCommentForm;
