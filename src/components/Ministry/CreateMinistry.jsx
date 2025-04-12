import { useState, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogBody,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createMinistrySchema } from "@/zodSchema/CreateMinistrySchema";
import { Textarea } from "../ui/textarea";
import useMinistry from "@/hooks/useMinistry";
import CustomReactSelect from "../CustomReactSelect";
import { ROLES } from "@/constants/roles";
import { getUsersByRole } from "@/services/userService";
import { Label } from "../ui/label";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";

const CreateMinistry = ({
  children,
  ministryId,
  ministryImage,
  ministryTitle,
  ministryDescription,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null); // Use ref instead of key for file input
  const isEditMode = !!ministryId;

  // Get coordinator options - only needed for create mode
  const { data: coordinators, isLoading: coordinatorLoading } = useQuery({
    queryKey: ["coordinators"],
    queryFn: async () => getUsersByRole(ROLES[0]),
    enabled: !isEditMode, // Only fetch coordinators when creating, not editing
  });

  const { data: volunteers, isLoading: volunteersLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: async () => getUsersByRole(ROLES[1]),
    enabled: !isEditMode, // Only fetch volunteers when creating, not editing
  });

  // Create a schema based on edit mode
  const formSchema = isEditMode
    ? createMinistrySchema.omit({ coordinators: true }) // Remove coordinators requirement in edit mode
    : createMinistrySchema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coordinators: [],
      ministryName: "",
      ministryDescription: "",
      ministryImage: null,
    },
  });

  // Set form defaults when editing
  useEffect(() => {
    if (isEditMode && openDialog) {
      form.setValue("ministryName", ministryTitle || "");
      form.setValue("ministryDescription", ministryDescription || "");

      // Important: Don't set a value for ministryImage in edit mode initially
      // We'll only set it if the user selects a new file
      if (ministryImage) {
        setImagePreview(ministryImage);
      }
    }
  }, [
    isEditMode,
    ministryTitle,
    ministryDescription,
    ministryImage,
    form,
    openDialog,
  ]);

  const adminsCoordinators = [...(volunteers ?? []), ...(coordinators ?? [])];

  const coordinatorOptions = adminsCoordinators?.map((coordinator) => ({
    value: coordinator.id,
    label: `${coordinator.first_name} ${coordinator.last_name}`,
  }));

  const { createMutation, updateMinistryMutation } = useMinistry({
    ministryId,
  });

  // Update reset logic
  const resetForm = () => {
    form.reset({
      coordinators: [],
      ministryName: "",
      ministryDescription: "",
      ministryImage: null,
    });
    setImagePreview(null);

    // The safest way to reset a file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = (values) => {
    if (isEditMode) {
      // Create the update object first
      const updateData = {
        ministryId,
        ministry_name: values.ministryName,
        ministry_description: values.ministryDescription,
      };

      // Only add ministry_image if it's a File object (meaning a new image was selected)
      if (values.ministryImage instanceof File) {
        updateData.ministry_image = values.ministryImage;
      }

      updateMinistryMutation.mutate(updateData, {
        onSuccess: () => {
          setOpenDialog(false);
          queryClient.invalidateQueries(["ministries"]);
          queryClient.invalidateQueries(["assigned-ministries"]);
        },
      });
    } else {
      // Create mode - include coordinators
      const coordinators = Array.isArray(values.coordinators)
        ? values.coordinators
        : values.coordinators
          ? [values.coordinators]
          : [];

      createMutation.mutate(
        {
          coordinators,
          ministry_name: values.ministryName,
          ministry_description: values.ministryDescription,
          ministry_image: values.ministryImage,
        },
        {
          onSuccess: () => {
            setOpenDialog(false);
            queryClient.invalidateQueries(["ministries"]);
            queryClient.invalidateQueries(["assigned-ministries"]);
          },
        }
      );
    }
    resetForm(); // Use our custom reset function
  };

  const isSubmitting =
    createMutation.isPending || updateMinistryMutation?.isPending;

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) {
          resetForm(); // Use our custom reset function
        }
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar h-[80%] overflow-scroll border-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold text-accent">
            {isEditMode ? "Edit Ministry" : "Create New Ministry"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-accent/80">
            {isEditMode
              ? "Update ministry details."
              : "Add details about your ministry."}
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

              {/* Only show coordinators field in create mode */}
              {!isEditMode && (
                <FormField
                  control={form.control}
                  name="coordinators"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Coordinators</FormLabel>
                      <FormControl>
                        <CustomReactSelect
                          isLoading={coordinatorLoading || volunteersLoading}
                          onChange={(selectedOptions) =>
                            field.onChange(
                              selectedOptions?.map((option) => option.value) ||
                                []
                            )
                          }
                          options={coordinatorOptions}
                          value={coordinatorOptions.filter((option) =>
                            field.value?.includes(option.value)
                          )}
                          placeholder="Select Coordinators..."
                          isMulti
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                        // Remove the spread of rest props that might cause issues
                      />
                    </FormControl>
                    {imagePreview ? (
                      <div className="relative h-full min-h-[210px] w-full overflow-hidden rounded-lg">
                        <img
                          className="w-full"
                          src={imagePreview}
                          alt="Ministry logo"
                        />
                        <Icon
                          onClick={() => {
                            setImagePreview(null);
                            form.setValue("ministryImage", null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ""; // Safely reset file input
                            }
                          }}
                          className="absolute right-4 top-4 text-2xl text-accent hover:cursor-pointer hover:text-red-600"
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
                            {isEditMode ? "Change" : "Upload"} Ministry Image
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
              <AlertDialogCancel asChild>
                <Button
                  onClick={() => resetForm()} // Use our custom reset function
                  variant="outline"
                >
                  Cancel
                </Button>
              </AlertDialogCancel>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update"
                    : "Create"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

CreateMinistry.propTypes = {
  children: PropTypes.node,
  ministryId: PropTypes.string,
  ministryImage: PropTypes.string,
  ministryTitle: PropTypes.string,
  ministryDescription: PropTypes.string,
};

export default CreateMinistry;
