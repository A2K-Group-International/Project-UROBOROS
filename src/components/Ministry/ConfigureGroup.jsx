import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";

import PropTypes from "prop-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogBody,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";
import CreateGroup from "./CreateGroup";
import useGroups from "@/hooks/useGroups";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitial } from "@/lib/utils";
import useMinistry from "@/hooks/useMinistry";
import { useQueryClient } from "@tanstack/react-query";

const allowedMimeTypes = ["image/jpeg", "image/png"];

const editMinistrySchema = z.object({
  ministryName: z.string().min(1, "Ministry name is required"),
  ministryDescription: z
    .string()
    .max(128, "Ministry description must be 128 characters or less")
    .optional(),
  // Make ministryImage truly optional with no validation if not provided
  ministryImage: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "Image size must be less than 5MB"
        )
        .refine(
          (file) => allowedMimeTypes.includes(file.type),
          "Invalid file type. Allowed: jpg, jpeg, png"
        ),
      z.string(), // For URLs
      z.null(), // For no image
      z.undefined(), // For optional
    ])
    .optional(),
});

const editGroupSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required.",
  }),
  description: z.string().optional(),
  groupImage: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "Image size must be less than 5MB"
        )
        .refine(
          (file) => ["image/jpeg", "image/png"].includes(file.type),
          "Invalid file type. Allowed: jpg, jpeg, png"
        ),
      z.string(), // For URLs
      z.null(), // For no image
      z.undefined(), // For optional
    ])
    .optional(),
});

const ConfigureGroup = ({
  ministryId,
  ministryName,
  ministryDescription,
  ministryImage,
}) => {
  const { groups } = useGroups({ ministryId });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost">
          <Icon icon="mingcute:more-2-line" className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar max-h-[35rem] overflow-y-scroll rounded-2xl py-6 text-primary-text">
        <AlertDialogHeader className="flex-row items-center justify-between space-y-0 px-6 text-start leading-none">
          <div>
            <div className="flex items-center gap-x-2">
              <Avatar className="flex h-10 w-10 justify-center rounded-[4px] bg-primary">
                <AvatarImage
                  className="h-10 w-10 rounded-[4px] object-cover"
                  src={ministryImage}
                  alt="profile picture"
                />
                <AvatarFallback className="h-10 w-10 rounded-[4px] bg-primary">
                  {getInitial(ministryName)}
                </AvatarFallback>
              </Avatar>
              <AlertDialogTitle className="pr-0">
                {ministryName}
              </AlertDialogTitle>
              <EditMinistry
                ministryId={ministryId}
                ministryName={ministryName}
                ministryDescription={ministryDescription}
                ministryImage={ministryImage}
              />
            </div>
            <AlertDialogDescription>
              {ministryDescription}
            </AlertDialogDescription>
          </div>
          <div>
            <CreateGroup ministryId={ministryId} />
          </div>
        </AlertDialogHeader>
        <AlertDialogBody>
          {groups?.data?.length < 1 ? (
            <p>No groups created yet.</p>
          ) : (
            <Label>Groups</Label>
          )}
          {groups?.data?.map((group) => (
            <div
              key={group.id}
              className="group mt-2 flex items-center justify-between rounded-lg bg-primary-outline/20 px-4 py-2 hover:bg-primary"
            >
              <div>
                <div className="flex items-center justify-center gap-x-2">
                  <Avatar>
                    <AvatarImage
                      className="h-10 w-10 rounded-[4px] object-cover"
                      src={group.image_url}
                      alt="profile picture"
                    />
                    <AvatarFallback>
                      {group.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Label className="font-semibold">{group.name}</Label>
                </div>

                <p className="text-xs text-primary-text">{group.description}</p>
              </div>
              <div className="flex items-center gap-x-2 border-primary-text/30 pl-2 transition-opacity duration-150 group-hover:opacity-100 lg:opacity-0">
                <EditGroup
                  groupId={group.id}
                  groupName={group.name}
                  groupDescription={group.description}
                  groupImage={group.image_url}
                />
                <DeleteGroup groupId={group.id} />
              </div>
            </div>
          ))}
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogAction className="border border-primary-outline/50 bg-white font-medium text-primary-text hover:bg-primary">
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ConfigureGroup.propTypes = {
  ministryId: PropTypes.string.isRequired,
  ministryName: PropTypes.string.isRequired,
  ministryDescription: PropTypes.string,
  ministryImage: PropTypes.string,
};

const EditMinistry = ({
  ministryId,
  ministryName,
  ministryDescription,
  ministryImage,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(ministryImage || null);
  const fileInputRef = useRef(null);

  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(editMinistrySchema),
    defaultValues: {
      ministryName,
      ministryDescription,
      ministryImage,
    },
  });

  const { updateMinistryMutation } = useMinistry({
    ministryId,
  });

  const onSubmit = (values) => {
    const updateData = {
      ministryId,
      ministry_name: values.ministryName,
      ministry_description: values.ministryDescription,
    };

    // Handle all image scenarios:
    if (values.ministryImage instanceof File) {
      // 1. New image selected
      updateData.ministry_image = values.ministryImage;
    } else if (values.ministryImage === null && imagePreview === null) {
      // 2. Image explicitly removed - the user clicked the X button
      updateData.ministry_image = null; // Explicitly set to null to remove it
    }

    updateMinistryMutation.mutate(updateData, {
      onSuccess: () => {
        queryClient.invalidateQueries(["ministries"]);
        queryClient.invalidateQueries(["assigned-ministries"]);

        setDialogOpen(false);
      },
    });
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" onClick={() => setDialogOpen(true)}>
          <Icon icon="mingcute:edit-2-fill" width={18} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar max-h-[85dvh] overflow-scroll border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-accent">
            Edit Ministry
          </AlertDialogTitle>
          <AlertDialogDescription className="text-accent/80">
            Update ministry details
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 text-start"
          >
            <AlertDialogBody className="space-y-5">
              {/* Ministry Information Card */}
              <FormField
                control={form.control}
                name="ministryName"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className="font-bold">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ministryDescription"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className="font-bold">
                      Description
                      <span className="font-light italic">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your Ministry. (Maximum of 128 characters)"
                        {...field}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ministryImage"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Ministry Image</FormLabel>
                    <FormControl>
                      <Input
                        ref={fileInputRef} // Use ref instead of key
                        id="file-input"
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        // Explicitly never set the value prop
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setImagePreview(previewUrl);
                            onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    {imagePreview ? (
                      <div className="relative mx-auto w-40 overflow-hidden rounded-lg">
                        <img
                          className="object-contain"
                          src={imagePreview}
                          alt="Ministry logo"
                        />
                        <Icon
                          onClick={() => {
                            setImagePreview(null);
                            form.setValue("ministryImage", null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute right-0 top-0 text-2xl text-accent hover:cursor-pointer hover:text-red-600"
                          icon={"mingcute:close-circle-fill"}
                        />
                      </div>
                    ) : (
                      <Label htmlFor="file-input">
                        <div className="flex h-[210px] flex-col items-center justify-center rounded-lg border border-dashed border-accent/60 hover:cursor-pointer hover:bg-accent/5">
                          <div className="flex flex-shrink-0 items-center justify-center rounded-md">
                            <Icon
                              className="h-11 w-11 text-[#CDA996]"
                              icon={"mingcute:pic-fill"}
                            />
                          </div>
                          <p className="text-[12px] font-semibold text-[#CDA996]">
                            Change Ministry Image
                          </p>
                        </div>
                      </Label>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                disabled={updateMinistryMutation?.isPending}
                className="flex-1"
              >
                {updateMinistryMutation?.isPending ? "Updating" : "Update"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

EditMinistry.propTypes = {
  ministryId: PropTypes.string.isRequired,
  ministryName: PropTypes.string.isRequired,
  ministryDescription: PropTypes.string,
  ministryImage: PropTypes.string,
};

const EditGroup = ({ groupId, groupName, groupDescription, groupImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { editGroupMutation } = useGroups({ groupId });

  const [imagePreview, setImagePreview] = useState(groupImage || null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(editGroupSchema),
    defaultValues: {
      name: groupName,
      description: groupDescription || "",
      groupImage: groupImage || null,
    },
  });

  const onSubmit = (data) => {
    editGroupMutation.mutate(
      {
        groupId,
        name: data.name,
        description: data.description,
        groupImage: data.groupImage,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          form.reset({
            name: data.name,
            description: data.description,
            groupImage: data.image_url,
          });
        },
      }
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="xs"
          className="bg-primary-outline/60 font-medium text-primary-text"
        >
          Edit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Group</AlertDialogTitle>
          <AlertDialogDescription>
            Update the information for this group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="form"
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your group..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupImage"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Group Image</FormLabel>
                    <FormControl>
                      <Input
                        ref={fileInputRef}
                        id="file-input"
                        type="file"
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const previewUrl = URL.createObjectURL(file);
                            setImagePreview(previewUrl);
                            onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    {imagePreview ? (
                      <div className="relative mx-auto w-40 overflow-hidden rounded-lg">
                        <img
                          className="object-contain"
                          src={imagePreview}
                          alt="Group logo"
                        />
                        <Icon
                          onClick={() => {
                            setImagePreview(null);
                            form.setValue("groupImage", null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute right-0 top-0 text-2xl text-accent hover:cursor-pointer hover:text-red-600"
                          icon={"mingcute:close-circle-fill"}
                        />
                      </div>
                    ) : (
                      <Label htmlFor="file-input">
                        <div className="flex h-[210px] flex-col items-center justify-center rounded-lg border border-dashed border-accent/60 hover:cursor-pointer hover:bg-accent/5">
                          <div className="flex flex-shrink-0 items-center justify-center rounded-md">
                            <Icon
                              className="h-11 w-11 text-[#CDA996]"
                              icon={"mingcute:pic-fill"}
                            />
                          </div>
                          <p className="text-[12px] font-semibold text-[#CDA996]">
                            {groupImage ? "Change" : "Upload"} Group Image
                          </p>
                        </div>
                      </Label>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={editGroupMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            form="form"
            disabled={editGroupMutation.isPending || !form.formState.isDirty}
          >
            {editGroupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

EditGroup.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupName: PropTypes.string.isRequired,
  groupDescription: PropTypes.string,
  groupImage: PropTypes.string,
};

const DeleteGroup = ({ groupId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { deleteGroupMutation } = useGroups({ groupId });

  const handleDeleteGroup = () => {
    deleteGroupMutation.mutate(
      { groupId },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      }
    );
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size="xs" variant="destructive">
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            group.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteGroupMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDeleteGroup}
              disabled={deleteGroupMutation.isPending}
              variant="destructive"
            >
              {deleteGroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Group"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteGroup.propTypes = {
  groupId: PropTypes.string.isRequired,
};

export default ConfigureGroup;
