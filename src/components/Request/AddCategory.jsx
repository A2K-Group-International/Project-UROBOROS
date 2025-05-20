import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { useUser } from "@/context/useUser";
import useCategory from "@/hooks/useCategory";

const formSchema = z.object({
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
});

const AddCategory = ({ isEditing, categoryData, onClose }) => {
  const [open, setOpen] = useState(isEditing || false);
  const { userData } = useUser();
  const { addCategoryMutation, updateCategoryMutation } = useCategory();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: isEditing && categoryData ? categoryData.name : "",
    },
  });

  const onSubmit = (values) => {
    // Capitalize the first letter of each word in the category name
    const capitalizedCategory = values.category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    if (isEditing && categoryData) {
      updateCategoryMutation.mutate(
        {
          id: categoryData.id,
          category: capitalizedCategory,
        },
        {
          onSuccess: () => {
            handleClose();
            form.reset();
          },
          onError: (error) => {
            console.error("Error updating category:", error);
          },
        }
      );
    } else {
      addCategoryMutation.mutate(
        {
          category: capitalizedCategory,
          userId: userData.id,
        },
        {
          onSuccess: () => {
            handleClose();
            form.reset();
          },
          onError: (error) => {
            console.error("Error creating category:", error);
          },
        }
      );
    }
  };

  // Close dialog and call onClose prop if provided
  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    // If isEditing is true, open the dialog
    if (isEditing) {
      setOpen(true);
    }

    // If categoryData changes and we're editing, update the form
    if (isEditing && categoryData) {
      form.reset({
        category: categoryData.name,
      });
    }
  }, [isEditing, categoryData, form]);

  // When dialog closes and we're editing, call onClose
  useEffect(() => {
    if (!open && isEditing && onClose) {
      onClose();
    }
  }, [open, isEditing, onClose]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-primary-text hover:text-primary-text"
          >
            <Icon icon="mingcute:add-circle-line" width={20} height={20} />
            Add Category
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isEditing ? "Edit Category" : "Add New Category"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isEditing
                  ? "Update the category name"
                  : "Add a new category for your event."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type a name for the category"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isEditing
                    ? updateCategoryMutation.isPending
                    : addCategoryMutation.isPending
                }
              >
                {isEditing ? (
                  updateCategoryMutation.isPending ? (
                    <>
                      <Icon
                        icon="mingcute:loading-3-line"
                        width={20}
                        height={20}
                        className="mr-2 animate-spin"
                      />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )
                ) : addCategoryMutation.isPending ? (
                  <>
                    <Icon
                      icon="mingcute:loading-3-line"
                      width={20}
                      height={20}
                      className="mr-2 animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AddCategory.propTypes = {
  isEditing: PropTypes.bool,
  categoryData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    creator_id: PropTypes.string, // UUID for the creator
    created_at: PropTypes.string, // ISO date string
  }),
  onClose: PropTypes.func,
};

export default AddCategory;
