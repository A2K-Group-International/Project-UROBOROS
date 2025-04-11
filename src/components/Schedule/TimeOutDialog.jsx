import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { parentsWithEmail } from "@/services/attendanceService";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  selectedParentsEmail: z
    .array(z.string())
    .optional()
    .refine(
      (value) => {
        // Only validate if value exists and is not empty
        // Return true to pass validation when value is undefined/null/empty
        return !value || value.length === 0 || value.some((item) => item);
      },
      {
        message: "Select at least one parent to notify.",
      }
    ),
});

const TimeOutDialog = ({ attendee }) => {
  const [isOpen, setIsOpen] = useState(false); // Handle dialog open
  const [attendeeInfo, setAttendeeInfo] = useState({}); // Handle child attendee info

  const { data: parents = [], isLoading: parentsLoading } = useQuery({
    queryKey: ["parents-with-email", attendee?.family_id],
    queryFn: () => parentsWithEmail(attendee?.family_id),
    enabled: !!attendee?.family_id && isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setAttendeeInfo(attendee);
      console.log(attendeeInfo);
    }
  }, [isOpen, attendee]);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      selectedParentsEmail: [],
    },
  });

  // Monitor selected parents
  const selectedEmails = form.watch("selectedParentsEmail") || [];
  const hasSelectedParents = selectedEmails.length > 0;

  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger>
        <Icon icon="mingcute:exit-line" width={20} />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Would you like to notify the parents via email?{" "}
            <span className="font-light">(optional)</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            An email will be sent to selected parents informing them that their
            child(ren) have timed out.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AlertDialogBody>
              {parentsLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="selectedParentsEmail"
                  render={() => (
                    <FormItem>
                      {parents.map((parent) => (
                        <FormField
                          key={parent.parents.id}
                          control={form.control}
                          name="selectedParentsEmail"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={parent.parents.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      parent.parents.email
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            parent.parents.email,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) =>
                                                value !== parent.parents.email
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {`${parent.first_name} ${parent.last_name}`}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit" className="flex-1">
                {hasSelectedParents ? "Send Email & Time Out" : "Time Out Only"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

TimeOutDialog.propTypes = {
  attendee: PropTypes.shape({
    id: PropTypes.string,
    attendee_id: PropTypes.string,
    attendee_type: PropTypes.string,
    event_id: PropTypes.string,
    attended: PropTypes.bool,
    main_applicant: PropTypes.bool,
    ticket_id: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    contact_number: PropTypes.string,
    family_id: PropTypes.string,
    registration_code: PropTypes.string,
    created_at: PropTypes.string,
    registered_by: PropTypes.shape({
      last_name: PropTypes.string,
      first_name: PropTypes.string,
    }),
    time_attended: PropTypes.string,
    time_out: PropTypes.string,
  }).isRequired,
};

export default TimeOutDialog;
