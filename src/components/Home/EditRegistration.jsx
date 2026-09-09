import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { editRegistrationSchema } from "@/zodSchema/EditRegistrationSchema";

import { fetchAttendeesByTicketCode } from "@/services/attendanceService";
import { handleWalkInData } from "@/services/walkInService";
import { EditSchema } from "@/zodSchema/EditSchema";
import useEvent from "@/hooks/useEvent";

// Attendance Coming from the database

const EditRegistration = () => {
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { toast } = useToast();

  //Registration Code Form
  const registrationForm = useForm({
    resolver: zodResolver(editRegistrationSchema),
    defaultValues: {
      registrationCode: "",
    },
  });
  // Form setup with react-hook-form and Zod validation
  const attendeeInformation = useForm({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      event: "",
      eventId: "",
      ticketCode: "", // This will allow the ticketCode to be part of the form
      familyId: "", // Add family_id here as a UUID
      parents: [
        {
          parentFirstName: "",
          parentLastName: "",
          parentContactNumber: "",
          isMainApplicant: false,
          id: "",
        },
      ],
      children: [
        {
          childFirstName: "",
          childLastName: "",
          id: "",
        },
      ],
    },
  });

  const handleRegistrationCodeSubmit = async (data) => {
    try {
      const result = await fetchAttendeesByTicketCode(
        data.registrationCode.trim()
      );

      if (result.success && result.data) {
        const user = result.data;

        // Set event details
        attendeeInformation.setValue("event", user.event.id);

        // Set family ID (newly included)
        attendeeInformation.setValue("familyId", user.familyId);

        // Set ticket code
        attendeeInformation.setValue("ticketCode", user.registrationCode);

        // Set parent details
        attendeeInformation.setValue(
          "parents",
          user.parents.map((parent) => ({
            id: parent.id || "default_parent_id",
            parentFirstName: parent.firstName,
            parentLastName: parent.lastName,
            parentContactNumber: parent.contactNumber,
            isMainApplicant: parent.isMainApplicant || false,
          }))
        );

        // Set child details
        attendeeInformation.setValue(
          "children",
          user.children.map((child) => ({
            id: child.id || "default_child_id",
            childFirstName: child.firstName,
            childLastName: child.lastName,
          }))
        );

        setIsCodeValid(true); // Mark code as valid
        registrationForm.reset({ registrationCode: "" }); // Reset code input
      } else {
        toast({
          title: "Registration Code Error",
          description: result.message || "Invalid registration code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error handling registration code:", error.message);
      toast({
        title: "Server Error",
        description:
          "Unable to fetch data at the moment. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveParent = (index) => {
    removeParent(index); // Just remove from the field array
  };

  const handleRemoveChild = (index) => {
    removeChild(index); // Just remove from the field array
  };

  // Function to submit editted user information
  const onSubmit = async (values) => {
    const { event: eventId, ticketCode, familyId } = values; // Extract event ID, ticket code, and family ID

    // Prepare parent records for submission, including familyId
    const parents = values.parents.map((parent) => ({
      event_id: eventId,
      registration_code: ticketCode,
      first_name: parent.parentFirstName,
      last_name: parent.parentLastName,
      mobile_number: parent.parentContactNumber,
      attendee_type: "parents",
      main_applicant: parent.isMainApplicant || false, // Handle optional field
      family_id: familyId, // Add family_id to each parent
    }));

    // Prepare child records for submission, including familyId
    const children = values.children.map((child) => ({
      event_id: eventId,
      registration_code: ticketCode,
      first_name: child.childFirstName,
      last_name: child.childLastName,
      attendee_type: "children",
      main_applicant: false, // Children are not main applicants
      family_id: familyId, // Add family_id to each child
    }));

    try {
      // Call handleWalkInData to process the records
      await handleWalkInData({
        eventId,
        ticketCode,
        parents,
        children,
      });

      handleDialogChange(false);
      toast({
        title: "Registration Updated Successfully",
        description: "The registration details have been updated successfully.",
      });
    } catch (error) {
      console.error("Error processing data:", error);

      // Error notification
      toast({
        title: "Error Processing Data",
        description:
          "An error occurred while processing the registration details.",
      });
    }
  };

  const {
    fields: parentFields,
    append: addParent,
    remove: removeParent,
  } = useFieldArray({
    control: attendeeInformation.control,
    name: "parents",
  });

  const {
    fields: childFields,
    append: addChild,
    remove: removeChild,
  } = useFieldArray({
    control: attendeeInformation.control,
    name: "children",
  });

  // Add parent function
  const addParentField = () => {
    addParent({
      parentId: "",
      parentFirstName: "",
      parentLastName: "",
      parentContactNumber: "",
      isMainApplicant: false,
    });
  };

  // Add child function
  const addChildField = () => {
    addChild({
      childId: "",
      childFirstName: "",
      childLastName: "",
    });
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

  const { walkInEvents } = useEvent();

  // Filter events
  const upcomingEvents = Array.isArray(walkInEvents)
    ? walkInEvents.filter((event) => {
        const eventDateTime = new Date(
          event.dateTime || `${event.event_date}T${event.event_time}`
        );

        return eventDateTime;
      })
    : [];

  // Reset the forms when closing the dialog
  const handleDialogChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      registrationForm.reset();
      attendeeInformation.reset();
      setIsCodeValid(false);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="landingsecondary" disabled={true}>
            Edit Registration
          </Button>
        </DialogTrigger>
        <DialogContent
          className={`no-scrollbar max-w-96 overflow-scroll ${isCodeValid ? "sm:max-w-2xl md:max-h-[38rem]" : "max-h-[45rem]"}`}
        >
          <DialogHeader>
            <DialogTitle>
              {isCodeValid ? "Edit Registration" : "Edit Registration"}
            </DialogTitle>
            <DialogDescription>
              Update your registration details as needed.
            </DialogDescription>
          </DialogHeader>
          {isCodeValid ? (
            <div className="flex flex-col gap-y-4">
              <Form {...attendeeInformation}>
                <form
                  onSubmit={attendeeInformation.handleSubmit(onSubmit)}
                  className="space-y-2"
                >
                  {/* Event Name */}
                  <Label className="text-lg">Upcoming Events</Label>
                  <FormField
                    control={attendeeInformation.control}
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
                                  {event.event_name} -{" "}
                                  {formatDateTime(
                                    event.dateTime ||
                                      `${event.event_date}T${event.event_time}`
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
                      <FormField
                        control={attendeeInformation.control}
                        name={`parents[${index}].isMainApplicant`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row-reverse items-center">
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
                                        attendeeInformation.setValue(
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
                      {/* Parent ID (Read-Only Display) */}
                      <FormField
                        control={attendeeInformation.control}
                        name={`parents[${index}].id`}
                        render={({ field }) => (
                          <FormItem
                            className="flex-1"
                            style={{ display: "none" }}
                          >
                            {/* Hide this input */}
                            <FormControl>
                              <Input placeholder="ID" {...field} readOnly />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={attendeeInformation.control}
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
                        control={attendeeInformation.control}
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
                        control={attendeeInformation.control}
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
                      {parentFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveParent(index)} // Use the updated function
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Button to add another parent/guardian */}
                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" onClick={addParentField}>
                      Add Parent/Guardian
                    </Button>
                  </div>
                  <Label className="text-lg">Children</Label>
                  {childFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-2 sm:flex-row sm:items-start"
                    >
                      {/* Child ID (Read-Only Display) */}
                      <FormField
                        control={attendeeInformation.control}
                        name={`children[${index}].id`}
                        render={({ field }) => (
                          <FormItem
                            className="flex-1"
                            style={{ display: "none" }}
                          >
                            {/* Hide this input */}
                            <FormControl>
                              <Input placeholder="ID" {...field} readOnly />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* First Name */}
                      <FormField
                        control={attendeeInformation.control}
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

                      {/* Last Name */}
                      <FormField
                        control={attendeeInformation.control}
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
                          onClick={() => handleRemoveChild(index)} // Use the updated function
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2">
                    <Button type="button" size="sm" onClick={addChildField}>
                      Add Child
                    </Button>
                  </div>
                  <DialogFooter>
                    <div className="flex justify-end gap-2">
                      <DialogClose>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Submit</Button>
                    </div>
                  </DialogFooter>
                </form>
              </Form>
            </div>
          ) : (
            <Form {...registrationForm}>
              <form
                onSubmit={registrationForm.handleSubmit(
                  handleRegistrationCodeSubmit
                )}
                className="space-y-8"
              >
                <FormField
                  control={registrationForm.control}
                  name="registrationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Enter the registration code provided after your walk-in
                        registration to edit your details.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-y-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Submit</Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditRegistration;
