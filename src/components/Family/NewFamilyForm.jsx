import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useToast } from "@/hooks/use-toast";
import { newFamilySchema } from "@/zodSchema/Family/NewFamilyFormSchema";
import {
  checkDuplicatedFamilyMember,
  getFamilyId,
} from "@/services/familyService";
import { useUser } from "@/context/useUser";
import useAddParent from "@/hooks/Family/useAddParent";
import useAddChild from "@/hooks/Family/useAddChild";

const NewFamilyForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();
  const { userData } = useUser();
  const userId = userData?.id;

  const form = useForm({
    resolver: zodResolver(newFamilySchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      type: "guardian",
      mobile_number: "",
    },
  });

  // Reset the fields if the type changes
  const handleTypeChange = (value) => {
    form.setValue("type", value);
    form.setValue("first_name", "");
    form.setValue("last_name", "");
    if (value !== "guardian") {
      form.setValue("mobile_number", "");
    }
  };

  // Reset the dialog before opening
  const handleReset = () => {
    form.setValue("type", "guardian");
    form.setValue("first_name", "");
    form.setValue("last_name", "");
    form.setValue("mobile_number", "");
  };

  // Mutation for adding parent
  const { mutate: addParent } = useAddParent();
  // Mutation for adding child
  const { mutate: addChild } = useAddChild();

  const onSubmit = async (data) => {
    try {
      // Fetch family ID
      const familyId = await getFamilyId(userId);

      // Create a new family member object
      const newMember = {
        firstName: data.first_name.trim(),
        lastName: data.last_name.trim(),
        contactNumber: data.mobile_number?.trim(), // Only for guardian
      };

      // Check if the family member already exists
      const isDuplicate = await checkDuplicatedFamilyMember(
        familyId.id,
        newMember.firstName
      );

      if (isDuplicate) {
        toast({
          title: "Failed",
          description: `A family member with the name '${newMember.firstName} ${newMember.lastName}' already exists.`,
          variant: "destructive",
        });
        return;
      }

      // Handle adding guardian or child based on type
      if (data.type === "guardian") {
        addParent({
          members: [newMember],
          familyId: familyId.id,
        });
      } else if (data.type === "child") {
        addChild({
          members: [newMember],
          familyId: familyId.id,
        });
      } else {
        // Invalid type handling
        toast({
          title: "Invalid Type",
          description: "Submission type is not supported.",
          variant: "error",
        });
        return;
      }

      // Close modal on success
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          "An error occurred while adding the family member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleReset}>Add Family Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Required Information</DialogTitle>
          <DialogDescription>
            Please provide the necessary details to add a new family member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-3"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={handleTypeChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="guardian">
                          Parent/Guardian
                        </SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem className="grow">
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
                name="last_name"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Conditionally render the Contact Number field based on the type */}
            {form.watch("type") === "guardian" && (
              <FormField
                control={form.control}
                name="mobile_number"
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
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFamilyForm;
