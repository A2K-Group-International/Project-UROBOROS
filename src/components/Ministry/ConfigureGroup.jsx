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

const ConfigureGroup = ({ ministryId, ministryName, ministryDescription }) => {
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
            <AlertDialogTitle>{ministryName}</AlertDialogTitle>
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
                              fileInputRef.current.value = ""; // Safely reset file input
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
