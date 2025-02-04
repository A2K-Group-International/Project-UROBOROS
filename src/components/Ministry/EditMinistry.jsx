import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { editMinistrySchema } from "@/zodSchema/EditMinistrySchema";
import { Textarea } from "../ui/textarea";
import useMinistry from "@/hooks/useMinistry";

const EditMinistry = ({
  ministryId,
  currentName,
  currentDescription,
  isOpen, // Use the isOpen prop passed from MinistryCard
  closeDialog, // Use the closeDialog function passed from MinistryCard
}) => {
  const form = useForm({
    resolver: zodResolver(editMinistrySchema),
    defaultValues: {
      ministryId,
      ministryName: currentName,
      ministryDescription: currentDescription,
    },
  });
  const { editMutation } = useMinistry(); // Use the hook

  const onSubmit = (values) => {
    // Call the editMinistry service with the values directly
    editMutation.mutate(values);

    // Close the dialog after submitting the form
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the details of your group. Changes will be saved
            immediately.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 text-start"
            >
              <FormField
                control={form.control}
                name="ministryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Group Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the public name of the group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ministryDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description{" "}
                      <span className="font-light italic">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Maximum of 128 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={editMutation.isPending}>
                  {editMutation.isPending ? "Updating..." : "Submit"}
                </Button>
              </div>
              {editMutation.isError && (
                <p className="text-red-500">
                  Error:{" "}
                  {editMutation.isError?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

// Add PropTypes validation
EditMinistry.propTypes = {
  ministryId: PropTypes.string.isRequired, // ministryId is required and should be a string
  currentName: PropTypes.string.isRequired, // currentName is required and should be a string
  currentDescription: PropTypes.string.isRequired, // currentDescription is required and should be a string
  isOpen: PropTypes.bool.isRequired, // isOpen is required and should be a boolean
  closeDialog: PropTypes.func.isRequired, // closeDialog is required and should be a function
};

export default EditMinistry;
