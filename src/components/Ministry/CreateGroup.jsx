import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import CustomReactSelect from "../CustomReactSelect";
import { ROLES } from "@/constants/roles";
import { useQuery } from "@tanstack/react-query";
import { getUsersByRole } from "@/services/userService";
import { useUser } from "@/context/useUser";
import useGroups from "@/hooks/useGroups";
import { useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import useMinistry from "@/hooks/useMinistry";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";
import ImageLoader from "@/lib/ImageLoader";

const createGroupSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required.",
  }),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
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

const CreateGroup = ({ ministryId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { userData } = useUser();

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const { coordinators: ministryCoordinatorsQuery } = useMinistry({
    ministryId,
  });

  const { data: coparents = [], isLoading: coparentsLoading } = useQuery({
    queryKey: ["coparent"],
    queryFn: async () => getUsersByRole(ROLES[3]),
  });

  const { data: parishioners = [], isLoading: parishionerLoading } = useQuery({
    queryKey: ["parishioner"],
    queryFn: async () => getUsersByRole(ROLES[2]),
  });

  const { data: volunteers = [], isLoading: volunteersLoading } = useQuery({
    queryKey: ["volunteer"],
    queryFn: async () => getUsersByRole(ROLES[1]),
  });

  const { data: coordinators = [], isLoading: coordinatorsLoading } = useQuery({
    queryKey: ["coordinator"],
    queryFn: async () => getUsersByRole(ROLES[0]),
  });

  // Get ministry coordinator IDs in a convenient format
  const ministryCoordinatorIds = useMemo(() => {
    if (
      !ministryCoordinatorsQuery.data ||
      !Array.isArray(ministryCoordinatorsQuery.data)
    ) {
      return new Set();
    }

    // Extract user IDs from the nested structure
    const coordinatorUserIds = ministryCoordinatorsQuery.data
      .map((coordinator) => coordinator.users?.id)
      .filter((id) => id != null);

    return new Set(coordinatorUserIds);
  }, [ministryCoordinatorsQuery.data]);

  const isLoadingMembers =
    coparentsLoading ||
    parishionerLoading ||
    volunteersLoading ||
    coordinatorsLoading ||
    ministryCoordinatorsQuery.isLoading;

  // Filter out users who are already coordinators in this ministry
  const filteredGroupMembers = useMemo(() => {
    // Combine all potential members
    const allMembers = [
      ...(coparents || []),
      ...(volunteers || []),
      ...(parishioners || []),
      ...(coordinators || []),
    ];

    // Filter out duplicates by ID (in case users appear in multiple role lists)
    const uniqueMembers = Array.from(
      new Map(allMembers.map((user) => [user.id, user])).values()
    );

    // Filter out users who are coordinators for this ministry
    // Also filter out current user
    const filtered = uniqueMembers.filter((user) => {
      const isCoordinator = ministryCoordinatorIds.has(user.id);
      const isCurrentUser = user.id === userData?.id;
      return !isCoordinator && !isCurrentUser;
    });

    return filtered;
  }, [
    coparents,
    volunteers,
    parishioners,
    coordinators,
    ministryCoordinatorIds,
    userData?.id,
  ]);

  const memberOptions = useMemo(() => {
    return filteredGroupMembers.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    }));
  }, [filteredGroupMembers]);

  const form = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
    },
  });

  const { createGroupMutation } = useGroups({ ministryId });
  const isCreatingGroup = createGroupMutation.isPending;

  const onSubmit = (data) => {
    createGroupMutation.mutate(
      {
        ministryId,
        name: data.name,
        description: data.description,
        created_by: userData?.id,
        members: data.members,
        groupImage: data.groupImage,
      },
      {
        onSuccess: () => {
          setOpenDialog(false);
          form.reset();
        },
      }
    );
  };

  return (
    <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-xl bg-primary-outline/30 text-primary-text"
          size="sm"
        >
          New Group
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar max-h-[38rem] overflow-scroll text-primary-text">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Group</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              id="form"
              onSubmit={form.handleSubmit(onSubmit)}
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
                      <div className="relative mx-auto w-full overflow-hidden rounded-lg">
                        <ImageLoader
                          className="h-[210px] w-full object-cover"
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
                            Upload Group Image
                          </p>
                        </div>
                      </Label>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Members
                      {isLoadingMembers && (
                        <span className="ml-2 inline-block h-4 w-4">
                          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <CustomReactSelect
                        isLoading={isLoadingMembers}
                        onChange={(selectedOptions) =>
                          field.onChange(
                            selectedOptions?.map((option) => option.value) || []
                          )
                        }
                        options={memberOptions}
                        value={memberOptions.filter((option) =>
                          field.value?.includes(option.value)
                        )}
                        placeholder={
                          isLoadingMembers
                            ? "Loading members..."
                            : "Select Members..."
                        }
                        isMulti
                        isDisabled={isLoadingMembers}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel className="m-0" disabled={isCreatingGroup}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="submit"
            form="form"
            disabled={isCreatingGroup}
            className="flex-1"
          >
            {isCreatingGroup ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Done"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

CreateGroup.propTypes = {
  ministryId: PropTypes.string.isRequired,
};

export default CreateGroup;
