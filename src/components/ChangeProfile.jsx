import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react";
import { Label } from "./ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Button } from "./ui/button";
import useProfile from "@/hooks/useProfile";
import PropTypes from "prop-types";
import imageCompression from "browser-image-compression";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const changeProfileSchema = z.object({
  image: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
          "Only .jpg, .jpeg, .png, and .webp formats are supported"
        )
        .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB"),
      z.literal(null), // User clicked "Remove"
      z.undefined(), // No change
    ])
    .optional(),
});

const ChangeProfile = ({ userId, profileImageUrl }) => {
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(profileImageUrl || null);

  const { updateProfilePictureMutation, removeProfilePictureMutation } =
    useProfile({ user_id: userId });

  const form = useForm({
    resolver: zodResolver(changeProfileSchema),
    defaultValues: {
      image: null,
    },
  });

  const handleOpenDialog = (open) => {
    if (!open) {
      form.reset();
      setImagePreview(null);
    }

    setOpen(open);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };

      const compressedBlob = await imageCompression(file, options);

      // Convert Blob to File with original filename and type
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
      form.setValue("image", compressedFile);
    } catch (error) {
      console.error("Compression error:", error);
      form.setValue("image", file);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (data.image === null) {
        // User wants to remove their profile picture
        await removeProfilePictureMutation.mutateAsync();
      } else if (data.image instanceof File) {
        // User wants to upload a new profile picture
        await updateProfilePictureMutation.mutateAsync(data.image);
      }

      // Close the dialog
      setOpen(false);
    } catch (error) {
      console.error("Error handling profile picture:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenDialog}>
      <AlertDialogTrigger className="absolute -bottom-2 right-0 rounded-full border bg-primary p-1 md:bottom-0 md:right-3">
        <Icon
          icon="mingcute:camera-2-fill"
          className="text-[18px] text-accent md:text-[24px]"
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change your profile picture</AlertDialogTitle>
          <AlertDialogDescription>
            Please upload a new profile picture.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="change-profile-form"
            >
              <FormField
                control={form.control}
                name="image"
                render={({ field: { ref } }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <>
                        <Input
                          ref={ref}
                          id="file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileChange(e);
                            }
                          }}
                        />
                        <div className="flex flex-col items-center gap-4">
                          {imagePreview ? (
                            <div className="relative">
                              <div className="h-[150px] w-[150px] overflow-hidden rounded-full">
                                <img
                                  className="h-full w-full object-cover"
                                  src={imagePreview}
                                  alt="Profile preview"
                                />
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview(null);
                                    form.setValue("image", null);
                                  }}
                                  className="absolute -top-1 right-0 rounded-full bg-primary px-1 text-accent"
                                >
                                  <Icon
                                    className="h-4 w-8"
                                    icon="mingcute:close-fill"
                                  />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Label
                              htmlFor="file-input"
                              className="border-gray-300 bg-gray-50 hover:bg-gray-100 flex h-[150px] w-[150px] cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed"
                            >
                              <Icon
                                className="text-gray-400 h-8 w-8"
                                icon="mingcute:add-line"
                              />
                              <span className="mt-2 text-sm text-accent">
                                Upload Image
                              </span>
                            </Label>
                          )}
                        </div>
                      </>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            type="submit"
            form="change-profile-form"
            className="flex-1"
            disabled={
              updateProfilePictureMutation.isPending ||
              removeProfilePictureMutation.isPending
            }
          >
            {updateProfilePictureMutation.isPending ||
            removeProfilePictureMutation.isPending ? (
              <Icon icon="mingcute:loading-3-fill" className="animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ChangeProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  profileImageUrl: PropTypes.string,
};

export default ChangeProfile;
