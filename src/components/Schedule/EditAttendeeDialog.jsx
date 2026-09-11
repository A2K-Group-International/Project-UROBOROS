import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Input } from "../ui/input";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parentSchema } from "@/zodSchema/AddFamilySchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editAttendee } from "@/services/attendanceService";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/useUser";
import { useSearchParams } from "react-router-dom";
import { isEqual } from "lodash";

const EditAttendeeDialog = ({ attendee, disableSchedule }) => {
  const [attendeeEdit, setAttendeeEdit] = useState(false);
  const [urlPrms] = useSearchParams();
  const queryClient = useQueryClient();
  const { userData } = useUser();

  const updateMutation = useMutation({
    mutationFn: async (data) => await editAttendee(data),
    onSuccess: () => {
      toast({
        title: "Edit Successful",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", urlPrms.get("event")],
      });
    },
  });

  const onSubmit = (data, attendeeId) => {
    // Format the times for comparison
    const attendeeData = {
      first_name: attendee.first_name,
      last_name: attendee.last_name,
      time_attended: formatTime(attendee.time_attended),
      time_out: formatTime(attendee.time_out),
    };
    if (attendee.attendee_type === "parents") {
      attendeeData.mobile_number = attendee.mobile_number;
    }

    // Compare submitted data with attendee data
    if (isEqual(data, attendeeData)) {
      // If the form data is the same as the attendee data, reset the form and close the dialog
      form.reset();
      setAttendeeEdit(false);
      return;
    }

    // Otherwise, proceed with the mutation
    updateMutation.mutate(
      {
        update_id: userData.id,
        ...data,
        attendeeId,
      },
      {
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: ["update_logs", attendeeId],
          });
        },
      }
    );
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    if (isNaN(date)) {
      console.error("Invalid date string:", isoString);
      return "";
    }

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const schema =
    attendee.attendee_type === "children"
      ? parentSchema.omit({ mobile_number: true })
      : parentSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      time_out: formatTime(attendee.time_out),
      time_attended: formatTime(attendee.time_attended),
      first_name: attendee.first_name,
      last_name: attendee.last_name,
      mobile_number: attendee.mobile_number,
    },
  });

  return (
    <Dialog open={attendeeEdit} onOpenChange={setAttendeeEdit}>
      {!disableSchedule && (
        <DialogTrigger asChild>
          <Button
            type="button"
            onClick={() => {
              setAttendeeEdit(true);
            }}
            variant="ghost"
            disabled={disableSchedule}
          >
            <Icon
              className="h-5 w-5 text-accent"
              disabled={disableSchedule}
              icon={"eva:edit-2-fill"}
            />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Edit ${attendee.attendee_type === "children" ? "Children" : "Parent"} Attendee`}</DialogTitle>
          <DialogDescription>Edit attendee information</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit(data, attendee.id);
              setAttendeeEdit(false);
            })}
          >
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      className="text-accent"
                      placeholder="First name"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      className="text-accent"
                      placeholder="Last name"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {attendee.attendee_type !== "children" && (
              <FormField
                control={form.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact</FormLabel>
                    <FormControl>
                      <Input
                        className="text-accent"
                        placeholder="Contact"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="time_attended"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time In</FormLabel>
                    <FormControl>
                      <Input
                        className="text-accent"
                        placeholder="Time In"
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time_out"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Out</FormLabel>
                    <FormControl>
                      <Input
                        className="text-accent"
                        placeholder="Time Out"
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

EditAttendeeDialog.propTypes = {
  attendee: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    mobile_number: PropTypes.string,
    attendee_type: PropTypes.string.isRequired,
    time_out: PropTypes.instanceOf(Date),
    time_attended: PropTypes.instanceOf(Date),
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disableSchedule: PropTypes.bool.isRequired,
};

export default EditAttendeeDialog;
