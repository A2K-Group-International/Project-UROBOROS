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

import useAddParent from "@/hooks/Family/useAddParent";

import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

const formSchema = z.object({
  firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
  lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
  contactNumber: ukPhoneNumberValidation(),
});

const AddParent = ({ familyId, familyFirstName, familyLastName }) => {
  const [open, setOpen] = useState(false);
  const { mutate: addParentMutation, isPending: isAdding } = useAddParent();

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
    const parentData = {
      members: [
        {
          firstName: values.firstName,
          lastName: values.lastName,
          contactNumber: values.contactNumber,
        },
      ],
      familyId,
    };
    addParentMutation(parentData, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-7 w-7 rounded-lg">
          <Icon className="h-5 w-3 text-white" icon="mingcute:add-fill"></Icon>
        </Button>
      </DialogTrigger>
      <DialogContent className="text-primary-text">
        <DialogHeader className="text-start">
          <DialogTitle>
            Add Family Member to{" "}
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
                        <Input {...field} placeholder="John" />
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
                        <Input {...field} placeholder="Doe" />
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
                      <FormLabel className="text-primary-text">
                        Contact Tel. No
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="07123456789"
                          type="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={isAdding}
                    >
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

AddParent.propTypes = {
  familyId: PropTypes.string.isRequired,
  familyFirstName: PropTypes.string.isRequired,
  familyLastName: PropTypes.string.isRequired,
};

export default AddParent;
