import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMemo, useState, useRef, useEffect } from "react";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/context/useUser";
import { Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";
import { fetchGroupMembers } from "@/services/groupServices";
import { createSubgroup } from "@/services/subgroupServices";
import { toast } from "@/hooks/use-toast";

const CreateSubGroupSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required.",
  }),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
  subgroupImage: z
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
      //optional not working without these
      z.null(), //  allow null values
      z.undefined(), // allow undefined values
    ])
    .optional(),
});

const CreateSubgroup = ({ groupId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { userData } = useUser();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch group members
  const {
    data: groupMembers = [],
    isLoading: isLoadingMembers,
    error,
  } = useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => fetchGroupMembers(groupId),
    enabled: !!groupId,
  });

  // Handle errors in fetching group members
  if (error) {
    toast({
      title: "Error fetching group members",
      description: error.message,
      variant: "destructive",
    });
  }

  // Memoize member options
  const memberOptions = useMemo(() => {
    return groupMembers?.map((member) => ({
      value: member.users.id,
      label: `${member.users.first_name} ${member.users.last_name}`,
    }));
  }, [groupMembers]);

  const form = useForm({
    resolver: zodResolver(CreateSubGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      members: [],
      subgroupImage: null,
    },
  });

  const createSubgroupMutation = useMutation({
    mutationFn: createSubgroup,
    onError: (error) => {
      toast({
        title: "Error creating subgroup",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Subgroup created",
        description: "Subgroup created successfully",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["subgroups", groupId],
      });
    },
  });

  const resetForm = () => {
    form.reset();
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data) => {
    createSubgroupMutation.mutate(
      {
        groupId,
        name: data.name,
        description: data.description,
        created_by: userData?.id,
        members: data.members,
        subgroupImage: data.subgroupImage,
      },
      {
        onSuccess: () => {
          resetForm();
          setOpenDialog(false);
        },
      }
    );
  };
  // Add cleanup effect for the imagePreview URL
  useEffect(() => {
    // Cleanup function that runs when component unmounts or imagePreview changes
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const isCreatingSubgroup = createSubgroupMutation.isLoading;

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) resetForm();
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-xl bg-primary-outline/30 text-primary-text"
          size="sm"
        >
          New Subgroup
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar max-h-[38rem] overflow-scroll text-primary-text">
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Subgroup</AlertDialogTitle>
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
                      <Input placeholder="Enter Subgroup Name" {...field} />
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
                        placeholder="Describe your subgroup..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subgroupImage"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Subgroup Image</FormLabel>
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
                          alt="Subgroup logo"
                        />
                        <Icon
                          onClick={() => {
                            if (imagePreview) {
                              URL.revokeObjectURL(imagePreview);
                            }
                            fileInputRef.current.value = "";
                            setImagePreview(null);
                            form.setValue("subgroupImage", null);
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
                            Upload Subgroup Image
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
                            ? "Loading group members..."
                            : memberOptions.length === 0
                              ? "No members available"
                              : "Select members for this subgroup..."
                        }
                        isMulti
                        isDisabled={
                          isLoadingMembers || memberOptions.length === 0
                        }
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
          <AlertDialogCancel className="m-0" disabled={isCreatingSubgroup}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="submit"
            form="form"
            disabled={isCreatingSubgroup}
            className="flex-1"
          >
            {isCreatingSubgroup ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Subgroup"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

CreateSubgroup.propTypes = {
  groupId: PropTypes.string.isRequired,
};

export default CreateSubgroup;
