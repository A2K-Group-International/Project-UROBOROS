import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  // AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  // FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { useUser } from "@/context/useUser";
import useAnnouncements from "@/hooks/useAnnouncements";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { fileTypes } from "@/constants/fileTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnnouncementSchema } from "@/zodSchema/AnnouncementSchema";
import { Label } from "../ui/label";
import PropTypes from "prop-types";
import { useSearchParams } from "react-router-dom";
import ImageLoader from "@/lib/ImageLoader";
ImageLoader;
const AnnouncementForm = ({
  files,
  title,
  content,
  announcementId,
  children,
  subgroupId,
  groupId,
}) => {
  const [searchParams] = useSearchParams();
  const { userData } = useUser();

  // Use the props first, then fall back to URL params if needed
  const subgroupIdToUse = subgroupId || searchParams.get("subgroupId");
  const groupIdToUse = groupId || searchParams.get("groupId");
  const fileInputRef = useRef(null);

  const [currentFiles, setCurrentFiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileType, setSelectedFileTypes] = useState(
    files ? "Image(s)" : "None"
  );
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedPDF, setSelectedPDF] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  // console.log("edit data", files);
  const form = useForm({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: title ?? "",
      content: content ?? "",
      files: files ?? [],
    },
  });

  const { addAnnouncementMutation, editAnnouncementMutation } =
    useAnnouncements({
      group_id: groupIdToUse,
      subgroup_id: subgroupIdToUse,
    });

  const onSubmit = (data) => {
    if (title) {
      editAnnouncementMutation.mutate({
        data,
        announcementId,
        groupId: groupIdToUse,
        subgroupId: subgroupIdToUse,
      });
    } else {
      addAnnouncementMutation.mutate({
        data,
        userId: userData?.id,
        groupId: groupIdToUse,
        subgroupId: subgroupIdToUse,
      });
    }

    form.reset();
    setCurrentFiles([]);
    setSelectedFileTypes("None");
    setSelectedVideo("");
    setSelectedPDF("");
    setImagePreviews([]);
    setIsOpen(false);
  };

  useEffect(() => {
    if (files && files.length > 0) {
      const fetchFiles = async () => {
        const fileObjects = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(file.url);
            const blob = await response.blob();
            return new File([blob], file.name, { type: file.type });
          })
        );

        form.setValue("files", fileObjects);
        setCurrentFiles(fileObjects);
        setImagePreviews(files.map((file) => file.url));
      };

      fetchFiles();
    }
  }, [files, form]);

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);

    const updatedFiles =
      Array.from(form.getValues("files"))?.filter((_, i) => i !== index) || [];

    // Update files in the form state
    form.setValue("files", updatedFiles);
    setCurrentFiles(updatedFiles);

    // Update filePreviews state
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    // Reset the file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
          setCurrentFiles([]);
          setImagePreviews([]);
          // Reset the file input value on close
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar h-fit overflow-scroll border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-accent">
            {title ? "Edit Announcement" : " Create Announcement"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {title
              ? "Edit your announcement."
              : " Create Announcement Publicly"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form id="announcement-form" {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            // encType="multipart/form-data"
          >
            <AlertDialogBody className={"space-y-5"}>
              {/* Title Field */}
              <div className="rounded-xl border border-primary-outline bg-primary/25 p-6 py-[18px]">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="rounded-none border-none bg-transparent p-0 font-bold text-accent placeholder:text-[16px] placeholder:text-accent/75"
                          placeholder="Announcement Title"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Separator />

                {/* Content Field */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="no-scrollbar resize-none rounded-none border-none bg-transparent p-0 text-accent placeholder:text-sm placeholder:text-accent/85"
                          placeholder="Announcement body..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div>
                {form.formState.errors.title && (
                  <p className="text-sm font-medium text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
                {form.formState.errors.content && (
                  <p className="text-sm font-medium text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              {/* Attachments Section */}

              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        id="file-input"
                        type="file"
                        accept={
                          selectedFileType === "Image(s)"
                            ? "image/*"
                            : selectedFileType === "Video"
                              ? "video/*"
                              : "application/*"
                        }
                        className="hidden"
                        multiple={selectedFileType === "Image(s)"}
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return; // Prevent errors

                          if (selectedFileType === "Image(s)") {
                            const fileArray = Array.from(files);

                            field.onChange([...currentFiles, ...fileArray]);
                            setCurrentFiles((prevState) => [
                              ...prevState,
                              ...fileArray,
                            ]);

                            // Create image previews
                            setImagePreviews((prevState) => [
                              ...prevState,
                              ...fileArray.map((file) =>
                                URL.createObjectURL(file)
                              ),
                            ]);
                            // Reset file input after selecting files
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          } else {
                            const file = files[0]; // Only one file for PDF or Video
                            const url = URL.createObjectURL(file);

                            if (file.type.startsWith("application")) {
                              setSelectedPDF(url);
                            } else {
                              setSelectedVideo(url);
                            }

                            form.setValue("files", [file]);
                            // Reset file input after selecting files
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="max-w-full space-y-2 rounded-xl border border-primary-outline bg-primary/25 px-6 pb-[12px] pt-[16px]">
                <p className="text-[12px] text-accent">
                  <span className="font-bold">Attachment:</span>{" "}
                  {selectedFileType}
                </p>
                <div className="flex gap-2">
                  {fileTypes.map(({ icon, value }, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setImagePreviews([]),
                          setSelectedFileTypes(value),
                          setCurrentFiles([]);
                        setSelectedVideo("");
                        setSelectedPDF("");
                        form.setValue("files", []);
                      }}
                      className={cn(
                        "rounded-xl bg-[#F1E6E0] px-[14px] py-[6px] hover:cursor-pointer",
                        { "bg-accent": selectedFileType === value }
                      )}
                    >
                      <Icon
                        className={cn("h-5 w-5 text-accent", {
                          "text-white": selectedFileType === value,
                        })}
                        icon={`mingcute:${icon}`}
                      />
                    </div>
                  ))}
                </div>
                <Separator />

                {selectedFileType === "Image(s)" && (
                  <div className="flex max-h-[110px] w-full max-w-[420px] gap-3 overflow-x-scroll">
                    {imagePreviews.map((url, index) => (
                      <div
                        key={index}
                        className="relative flex h-[100px] w-[100px] flex-shrink-0 rounded-md"
                      >
                        <ImageLoader
                          className="object-cover"
                          src={url}
                          alt="an image"
                        />
                        <Icon
                          onClick={() => handleRemoveFile(index)}
                          className="absolute right-1 top-1 text-xl text-accent hover:cursor-pointer"
                          icon={"mingcute:close-circle-fill"}
                        />
                      </div>
                    ))}
                    <Label htmlFor="file-input">
                      <div className="flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-md border border-primary-outline bg-[#F1E6E0] hover:cursor-pointer">
                        <Icon
                          className="h-9 w-9 text-accent"
                          icon={"mingcute:add-line"}
                        />
                      </div>
                    </Label>
                  </div>
                )}

                {selectedFileType === "Video" &&
                  (selectedVideo ? (
                    <div className="flex max-h-[110px] w-full max-w-[420px] justify-center gap-3 overflow-x-scroll">
                      <div className="relative flex h-[100px] w-[100px] flex-shrink-0 rounded-md">
                        <video
                          // className="object-cover"
                          controls="true"
                          src={selectedVideo}
                          alt="an image"
                        />
                      </div>
                    </div>
                  ) : (
                    <Label htmlFor="file-input">
                      <div className="flex h-[110px] flex-col items-center justify-center hover:cursor-pointer">
                        <div className="flex flex-shrink-0 items-center justify-center rounded-md">
                          <Icon
                            className="h-11 w-11 text-[#CDA996]"
                            icon={"mingcute:video-fill"}
                          />
                        </div>
                        <p className="text-[12px] font-semibold text-[#CDA996]">
                          Upload Video
                        </p>
                      </div>
                    </Label>
                  ))}
                {selectedFileType === "PDF Document" &&
                  (selectedPDF ? (
                    <div className="flex max-h-[110px] w-full max-w-[420px] items-center justify-center gap-3 overflow-x-scroll">
                      <div className="relative h-[100px] w-[100px] flex-shrink-0 rounded-md">
                        <Icon
                          className="h-11 w-11 text-[#CDA996]"
                          icon={"mingcute:attachment-2-fill"}
                        />
                        <p className="text-2xs text-[#CDA996]">
                          {form.getValues("files")[0]?.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Label htmlFor="file-input">
                      <div className="flex h-[110px] flex-col items-center justify-center hover:cursor-pointer">
                        <div className="flex flex-shrink-0 items-center justify-center rounded-md">
                          <Icon
                            className="h-11 w-11 text-[#CDA996]"
                            icon={"mingcute:attachment-2-fill"}
                          />
                        </div>
                        <p className="text-[12px] font-semibold text-[#CDA996]">
                          Upload File
                        </p>
                      </div>
                    </Label>
                  ))}
              </div>
              {form.formState.errors.files && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.files.message}
                </p>
              )}
            </AlertDialogBody>
            {/* Submit Button */}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button className="flex-1" type="submit">
                {addAnnouncementMutation.isPending ? "Posting..." : "Post"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AnnouncementForm.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string,
      type: PropTypes.string,
    })
  ),
  title: PropTypes.string,
  content: PropTypes.string,
  announcementId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  children: PropTypes.node.isRequired,
  subgroupId: PropTypes.string,
  groupId: PropTypes.string,
};

export default AnnouncementForm;
