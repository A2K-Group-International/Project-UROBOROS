import { useState } from "react";
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

import useAddChild from "@/hooks/Family/useAddChild";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" })
    .max(50, { message: "First name must not exceed 50 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" })
    .max(50, { message: "Last name must not exceed 50 characters" }),
});

const AddChild = ({ familyId, familyFirstName, familyLastName }) => {
  const [open, setOpen] = useState(false);
  const { mutate: addChildMutation, isPending: isAdding } = useAddChild();

  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
    },
  });
  const onSubmit = (values) => {
    const childData = {
      members: [
        {
          firstName: values.firstName,
          lastName: values.lastName,
          contactNumber: values.contactNumber,
        },
      ],
      familyId,
    };
    addChildMutation(childData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="h-6 w-5 rounded-lg">
          <Icon className="h-2 w-2 text-white" icon="mingcute:add-fill"></Icon>
        </Button>
      </DialogTrigger>
      <DialogContent className="text-primary-text">
        <DialogHeader className="text-start">
          <DialogTitle>
            Add Child to{" "}
            <span className="font-bold">{`${familyFirstName} ${familyLastName}`}</span>
          </DialogTitle>
          <DialogDescription className="font-medium">
            This form allows users to add a new family member by entering their
            first name and last name.
          </DialogDescription>
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-primary-text">
                        First Name
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className="text-primary-text">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose>
                    <Button variant="secondary" disabled={isAdding}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

AddChild.propTypes = {
  familyId: PropTypes.string.isRequired,
  familyFirstName: PropTypes.string.isRequired,
  familyLastName: PropTypes.string.isRequired,
};

export default AddChild;
