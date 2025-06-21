import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

import { cn, formatEventDate } from "@/lib/utils";

import Loading from "@/components/Loading";
import AddCategory from "@/components/Request/AddCategory";

import { getCategories } from "@/services/categoryServices";
import PropTypes from "prop-types";
import DeleteCategory from "./DeleteCategory";

const CategoryList = () => {
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading categories: {error.message}</div>;

  return (
    <>
      <div>
        <AddCategory />
      </div>
      <Table>
        <TableHeader className="bg-primary">
          <TableRow>
            <TableHead className="rounded-l-lg text-center">Name</TableHead>
            <TableHead className="text-center">Created by</TableHead>
            <TableHead className="text-center">Created at</TableHead>
            <TableHead className="rounded-r-lg text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories && categories.length > 0 ? (
            categories.map((category, index) => (
              <TableRow
                key={category.id}
                className={cn(
                  index % 2 !== 0
                    ? "rounded-l-lg bg-primary bg-opacity-35"
                    : "bg-white"
                )}
              >
                <TableCell className="text-center">{category.name}</TableCell>
                <TableCell className="text-center">
                  {category.creator_name}
                </TableCell>
                <TableCell className="text-center">
                  {formatEventDate(category.created_at)}
                </TableCell>
                <TableCell className="rounded-r-lg text-center">
                  <CategoryActionMenu category={category} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="py-4 text-center">
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
};

const CategoryActionMenu = ({ category }) => {
  const [isCategoryEditing, setIsCategoryEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEditCategory = () => {
    setIsCategoryEditing(true);
  };

  const handleDeleteCategory = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="transparent"
            className="h-auto border-0 border-none p-0"
            size="sm"
          >
            <Icon icon="mdi:dots-vertical" color="#000000" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleEditCategory}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteCategory}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isCategoryEditing && (
        <AddCategory
          isEditing={isCategoryEditing}
          categoryData={category}
          onClose={() => setIsCategoryEditing(false)}
        />
      )}
      {isDeleteDialogOpen && (
        <DeleteCategory
          category={category}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      )}
    </>
  );
};

CategoryActionMenu.propTypes = {
  category: PropTypes.object.isRequired,
};

export default CategoryList;
