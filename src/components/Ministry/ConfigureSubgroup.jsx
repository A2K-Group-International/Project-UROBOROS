import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@iconify/react";
import { toast } from "@/hooks/use-toast";
import {
  deleteSubgroup,
  fetchSubgroups,
  editSubgroup,
} from "@/services/subgroupServices";
import CreateSubgroup from "./createSubGroup";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const editSubgroupSchema = z.object({
  name: z.string().min(2, {
    message: "Name is required.",
  }),
  description: z.string().optional(),
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
      z.string(), // For URLs
      z.null(), // For no image
      z.undefined(), // For optional
    ])
    .optional(),
});

const ConfigureSubgroup = ({ groupId }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch subgroups
  const { data: subgroups = [], isLoading: isLoadingSubgroups } = useQuery({
    queryKey: ["subgroups", groupId],
    queryFn: () => fetchSubgroups(groupId),
    enabled: !!groupId && isOpen,
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger>
        <Icon icon="mingcute:more-2-line" className="h-5 w-5" />
      </AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar max-h-[35rem] overflow-y-scroll rounded-2xl py-6 text-primary-text">
        <AlertDialogHeader className="flex-row items-center justify-between space-y-0 px-6 text-start leading-none">
          <div>
            <AlertDialogTitle>Manage Subgroups</AlertDialogTitle>
            <AlertDialogDescription>
              Create and manage subgroups within this group
            </AlertDialogDescription>
          </div>
          <div>
            <CreateSubgroup groupId={groupId} />
          </div>
        </AlertDialogHeader>
        <AlertDialogBody>
          {isLoadingSubgroups ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : subgroups.length < 1 ? (
            <p>No subgroups created yet.</p>
          ) : (
            <>
              <Label>Subgroups</Label>
              {subgroups.map((subgroup) => (
                <div
                  key={subgroup.id}
                  className="group mt-2 flex items-center justify-between rounded-lg bg-primary-outline/20 px-4 py-2 hover:bg-primary"
                >
                  <div>
                    <div className="flex items-center justify-center gap-x-2">
                      <Avatar>
                        <AvatarImage
                          className="h-10 w-10 rounded-[4px] object-cover"
                          src={subgroup.image_url}
                          alt="profile picture"
                        />
                        <AvatarFallback>
                          {subgroup.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Label className="font-semibold">{subgroup.name}</Label>
                    </div>
                    <p className="text-xs text-primary-text">
                      {subgroup.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-x-2 border-primary-text/30 pl-2">
                    <EditSubgroup
                      subgroupId={subgroup.id}
                      subgroupName={subgroup.name}
                      subgroupDescription={subgroup.description}
                      subgroupImage={subgroup.image_url}
                      groupId={groupId}
                    />
                    <DeleteSubgroup
                      subgroupId={subgroup.id}
                      groupId={groupId}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
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

ConfigureSubgroup.propTypes = {
  groupId: PropTypes.string.isRequired,
};

const EditSubgroup = ({
  subgroupId,
  subgroupName,
  subgroupDescription,
  subgroupImage,
  groupId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(subgroupImage || null);
  const fileInputRef = useRef(null);

  const editSubgroupMutation = useMutation({
    mutationFn: editSubgroup,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subgroup updated successfully",
      });
      queryClient.invalidateQueries(["subgroups", groupId]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating subgroup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm({
    resolver: zodResolver(editSubgroupSchema),
    defaultValues: {
      name: subgroupName,
      description: subgroupDescription || "",
      subgroupImage: subgroupImage || null,
    },
  });

  const onSubmit = (data) => {
    editSubgroupMutation.mutate({
      subgroupId,
      name: data.name,
      description: data.description,
      subgroupImage: data.subgroupImage,
    });
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
          <AlertDialogTitle>Edit Subgroup</AlertDialogTitle>
          <AlertDialogDescription>
            Update the information for this subgroup.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="edit-subgroup-form"
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
                            setImagePreview(null);
                            form.setValue("subgroupImage", null);
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
                            {subgroupImage ? "Change" : "Upload"} Subgroup Image
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
          <AlertDialogCancel disabled={editSubgroupMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            type="submit"
            form="edit-subgroup-form"
            disabled={editSubgroupMutation.isPending || !form.formState.isDirty}
          >
            {editSubgroupMutation.isPending ? (
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

EditSubgroup.propTypes = {
  subgroupId: PropTypes.string.isRequired,
  subgroupName: PropTypes.string.isRequired,
  subgroupDescription: PropTypes.string,
  subgroupImage: PropTypes.string,
  groupId: PropTypes.string.isRequired,
};

const DeleteSubgroup = ({ subgroupId, groupId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteSubgroupMutation = useMutation({
    mutationFn: () => deleteSubgroup({ subgroupId }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subgroup deleted successfully",
      });
      queryClient.invalidateQueries(["subgroups", groupId]);
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subgroup",
        variant: "destructive",
      });
    },
  });

  const handleDeleteSubgroup = () => {
    deleteSubgroupMutation.mutate();
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
            subgroup.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSubgroupMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDeleteSubgroup}
              disabled={deleteSubgroupMutation.isPending}
              variant="destructive"
            >
              {deleteSubgroupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Subgroup"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteSubgroup.propTypes = {
  subgroupId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
};

export default ConfigureSubgroup;
