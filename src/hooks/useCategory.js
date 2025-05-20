import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "./use-toast";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/categoryServices";

const useCategory = () => {
  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category created.",
      });
    },
    onError: (error) => {
      queryClient.setQueryData(["categories"]);
      toast({
        title: "Error creating category",
        description: `${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });

  // Mutation for updating a category
  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating category",
        description: `${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Mutation for updating a category
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting category",
        description: `${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    addCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
};

export default useCategory;
