import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { editParentSchema } from "@/zodSchema/Family/EditParentSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2 } from "lucide-react";
import useEditParent from "@/hooks/Family/useEditParent";

const EditParent = ({ parent }) => {
  const [open, setOpen] = useState(false);
  const { mutate: editParentMutation, isPending: isEditing } = useEditParent();

  const form = useForm({
    resolver: zodResolver(editParentSchema),
    defaultValues: {
      firstName: parent.first_name || "",
      lastName: parent.last_name || "",
      contactNumber: parent.contact_number || "",
    },
  });

  // Update form values when parent prop changes
  useEffect(() => {
    if (parent) {
      form.reset({
        firstName: parent.first_name || "",
        lastName: parent.last_name || "",
        contactNumber: parent.contact_number || "",
      });
    }
  }, [parent, form]);

  const onSubmit = (values) => {
    editParentMutation(
      {
        parentId: parent.id,
        data: values,
        parentUserId: parent.users?.id, // Pass user ID if linked to a user account
      },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-auto rounded-xl px-2 text-accent hover:text-orange-500"
        >
          <Icon icon="mingcute:pencil-3-line" className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="text-primary-text">
        <DialogHeader className="text-start">
          <DialogTitle>Edit Parent Details</DialogTitle>
          <DialogDescription>
            Update the information for {parent.first_name} {parent.last_name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="First Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Last Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contact Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isEditing}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isEditing}>
                {isEditing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

EditParent.propTypes = {
  parent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    contact_number: PropTypes.string,
    users: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default EditParent;
