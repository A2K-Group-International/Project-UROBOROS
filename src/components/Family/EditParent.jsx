import { useState, forwardRef } from "react";
import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEditParent } from "@/hooks/useFamily";
import { editParentSchema } from "@/zodSchema/Family/EditParentSchema";

const EditParent = forwardRef(
  (
    {
      parentId,
      parentFirstName,
      parentLastName,
      parentContactNumber,
      parentUserId,
    },
    ref
  ) => {
    const [openDialog, setOpenDialog] = useState(false);
    const form = useForm({
      resolver: zodResolver(editParentSchema),
      defaultValues: {
        firstName: parentFirstName,
        lastName: parentLastName,
        contactNumber: parentContactNumber,
      },
    });

    const { mutate: editParent } = useEditParent();

    const onSubmit = async (data) => {
      const parentData = {
        firstName: data.firstName,
        lastName: data.lastName,
        contactNumber: data.contactNumber,
      };

      editParent({ parentId, data: parentData, parentUserId });
      setOpenDialog(false);
    };

    return (
      <div ref={ref}>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger className="flex pl-2 text-sm">Edit</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Parent/Guardian Information</DialogTitle>
              <DialogDescription className="sr-only">
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <div className="flex flex-col gap-2 text-start md:flex-row">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Tel No.</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <div className="flex justify-end gap-x-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Submit</Button>
                    </div>
                  </DialogFooter>
                </form>
              </Form>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

// Add PropTypes validation for childId prop
EditParent.propTypes = {
  parentId: PropTypes.string.isRequired,
  parentFirstName: PropTypes.string.isRequired,
  parentLastName: PropTypes.string.isRequired,
  parentContactNumber: PropTypes.string.isRequired,
  parentUserId: PropTypes.string,
};

EditParent.displayName = "EditParent";

export default EditParent;
