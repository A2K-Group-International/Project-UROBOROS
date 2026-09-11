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

const EditParentAttendeeDialog = ({
  form,
  attendee,
  onSubmit,
  disableSchedule,
}) => {
  const [attendeeEdit, setAttendeeEdit] = useState("");

  return (
    <Dialog open={attendeeEdit} onOpenChange={setAttendeeEdit}>
      {!disableSchedule && (
        <DialogTrigger asChild>
          <Button
            type="button"
            onClick={() => {
              form.setValue("first_name", `${attendee.first_name}`);
              form.setValue("last_name", `${attendee.last_name}`);
              form.setValue(
                "mobile_number",
                `${attendee.mobile_number.toString()}`
              );
              //   setIdEditting(attendee.id);
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
          <DialogTitle>Edit Attendee</DialogTitle>
          <DialogDescription>Edit attendee information</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit(data, attendee.id), setAttendeeEdit(false);
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
            <div className="mt-2 flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

EditParentAttendeeDialog.propTypes = {
  form: PropTypes.object.isRequired,
  attendee: PropTypes.shape({
    id: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    time_attended: PropTypes.instanceOf(Date),
    time_out: PropTypes.instanceOf(Date),
    mobile_number: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  disableSchedule: PropTypes.bool.isRequired,
};

export default EditParentAttendeeDialog;
