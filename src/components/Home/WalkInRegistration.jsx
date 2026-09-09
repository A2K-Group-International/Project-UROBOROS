import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { walkInRegisterSchema } from "@/zodSchema/WalkInRegisterSchema";

import useWalkInAttendance from "@/hooks/useWalkInAttendance";
import { useToast } from "@/hooks/use-toast";
import useEvent from "@/hooks/useEvent";

const WalkInRegistration = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [randomSixDigit, setRandomSixDigit] = useState(null);

  const { walkInEvents } = useEvent();

  const { mutate: registerAttendance, isLoading } = useWalkInAttendance(); // Initialize the mutation hook
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(walkInRegisterSchema),
    defaultValues: {
      event: "",
      parents: [
        {
          parentFirstName: "",
          parentLastName: "",
          parentContactNumber: "",
          isMainApplicant: true,
        },
      ],
      children: [
        {
          childFirstName: "",
          childLastName: "",
        },
      ],
    },
  });

  // Separate field arrays for parents and children
  const {
    fields: parentFields,
    append: addParent,
    remove: removeParent,
  } = useFieldArray({
    control: form.control,
    name: "parents",
  });

  const {
    fields: childFields,
    append: addChild,
    remove: removeChild,
  } = useFieldArray({
    control: form.control,
    name: "children",
  });

  const addParentField = () => {
    addParent({
      parentFirstName: "",
      parentLastName: "",
      parentContactNumber: "",
      isMainApplicant: false,
    });
  };

  const addChildField = () => {
    addChild({
      childFirstName: "",
      childLastName: "",
    });
  };

  // Generate random number
  const getRandomSixDigit = () => {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
  };

  // Submit handler
  const onSubmit = (values) => {
    if (!values.event) {
      // Show an error message if no event is selected
      toast({
        title: "Error",
        description: "Please select an event.",
        variant: "destructive",
      });
      return;
    }

    // Generate random six-digit number for ticket code
    const generatedNumber = getRandomSixDigit();
    setRandomSixDigit(generatedNumber); // Save generated number to state

    // Proceed with submission
    const { event, parents, children } = values;

    const submitData = {
      randomSixDigit: generatedNumber, // Use the generated six-digit ticket code
      event,
      parents: parents.map((parent) => ({
        parentFirstName: parent.parentFirstName,
        parentLastName: parent.parentLastName,
        parentContactNumber: parent.parentContactNumber,
        isMainApplicant: parent.isMainApplicant,
      })),
      children: children.map((child) => ({
        childFirstName: child.childFirstName,
        childLastName: child.childLastName,
      })),
    };

    // Register attendance with the submit data (including ticket code)
    registerAttendance(submitData);

    // Close the dialog after success
    setOpenDialog(false);

    // Show success modal with the random number (ticket code)
    setShowSuccessModal(true);
  };

  // Format the date
  const formatDateTime = (dateTime) => {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(dateTime));
  };

  // Filter events
  const upcomingEvents = Array.isArray(walkInEvents)
    ? walkInEvents.filter((event) => {
        const eventDateTime = new Date(
          event.dateTime || `${event.date}T${event.time}`
        );

        return eventDateTime;
      })
    : [];

  const handleDialogChange = (open) => {
    setOpenDialog(open);
    if (open) {
      // Reset form values and errors when opening the dialog
      form.reset();
    }
  };

  return (
    <>
      <Dialog open={openDialog} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="landingsecondary" disabled={true}>
            Walk - In Register
          </Button>
        </DialogTrigger>
        <DialogContent className="no-scrollbar max-h-[45rem] overflow-scroll sm:max-w-2xl md:max-h-[38rem]">
          <DialogHeader>
            <DialogTitle>Walk-In Registration</DialogTitle>
            <DialogDescription>Register for upcoming events.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-2"
              >
                {/* Event Name */}
                <Label className="text-lg">Upcoming Events</Label>
                <FormField
                  control={form.control}
                  name="event"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Event" />
                          </SelectTrigger>
                          <SelectContent>
                            {upcomingEvents.map((event) => (
                              <SelectItem key={event.id} value={event.id}>
                                {event.name} -{" "}
                                {formatDateTime(
                                  event.dateTime ||
                                    `${event.date}T${event.time}`
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Parent Guardian Field */}
                <Label className="text-lg">Parent/Guardian</Label>
                <span className="hidden text-sm italic text-zinc-400 md:block">
                  (Check the box on the left to choose the main applicant).
                </span>
                {parentFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start"
                  >
                    <div className="flex items-center">
                      <FormField
                        control={form.control}
                        name={`parents[${index}].isMainApplicant`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row-reverse items-center md:flex-1">
                            <FormLabel className="sm:hidden">
                              Check the box choose the main applicant.
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  field.onChange(isChecked);
                                  if (isChecked) {
                                    // Uncheck all other checkboxes
                                    parentFields.forEach((_, i) => {
                                      if (i !== index) {
                                        form.setValue(
                                          `parents[${i}].isMainApplicant`,
                                          false
                                        );
                                      }
                                    });
                                  }
                                }}
                                className="h-3 w-5"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`parents[${index}].parentFirstName`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`parents[${index}].parentLastName`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`parents[${index}].parentContactNumber`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Contact Tel No." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remove Button for each parent field */}
                    {parentFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeParent(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                {/* Button to add another parent/guardian */}
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" onClick={addParentField}>
                    Add
                  </Button>
                </div>
                <Label className="text-lg">Children</Label>
                {childFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-2 sm:flex-row sm:items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`children[${index}].childFirstName`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`children[${index}].childLastName`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remove Button for each child field */}
                    {childFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeChild(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" onClick={addChildField}>
                    Add
                  </Button>
                </div>
                <DialogFooter>
                  <div className="flex justify-end gap-2">
                    <DialogClose>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Submitting" : "Submit"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-primary-text">
            <DialogTitle>Registration Successful!</DialogTitle>
            <DialogDescription>
              Your registration was successful. Your unique code is:
            </DialogDescription>
          </DialogHeader>
          <div className="text-center">
            <p className="text-xl font-bold text-primary-text">
              {randomSixDigit}
            </p>
          </div>
          <DialogFooter className="flex justify-end">
            <DialogClose>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalkInRegistration;
