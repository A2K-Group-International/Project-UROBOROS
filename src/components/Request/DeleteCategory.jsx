import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react";
import useCategory from "@/hooks/useCategory";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const DeleteCategory = ({ category, open, onOpenChange }) => {
  const { deleteCategoryMutation } = useCategory();

  const confirmDelete = () => {
    deleteCategoryMutation.mutate(category.id, {
      onSuccess: () => {
        if (onOpenChange) onOpenChange(false);
      },
      onError: (error) => {
        console.error("Error deleting category:", error);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            {`Are you sure you want to delete the category "${category.name}"? This
            action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            onClick={confirmDelete}
            variant="destructive"
            className="flex-1"
            disabled={deleteCategoryMutation.isPending}
          >
            {deleteCategoryMutation.isPending ? (
              <>
                <Icon
                  icon="mingcute:loading-3-line"
                  width={20}
                  height={20}
                  className="mr-2 animate-spin"
                />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteCategory.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
};

export default DeleteCategory;
