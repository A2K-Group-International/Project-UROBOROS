import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { editChildSchema } from "@/zodSchema/Family/EditChildSchema";
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
import useEditChild from "@/hooks/Family/useEditChild";

const EditChild = ({ child }) => {
  const [open, setOpen] = useState(false);
  const { mutate: editChildMutation, isPending: isEditing } = useEditChild();

  const form = useForm({
    resolver: zodResolver(editChildSchema),
    defaultValues: {
      firstName: child.first_name || "",
      lastName: child.last_name || "",
    },
  });

  // Update form values when child prop changes
  useEffect(() => {
    if (child) {
      form.reset({
        firstName: child.first_name || "",
        lastName: child.last_name || "",
      });
    }
  }, [child, form]);

  const onSubmit = (values) => {
    editChildMutation(
      {
        childId: child.id,
        data: values,
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
          <DialogTitle>Edit Child Details</DialogTitle>
          <DialogDescription>
            Update the information for {child.first_name} {child.last_name}.
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

EditChild.propTypes = {
  child: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
  }).isRequired,
};

export default EditChild;
