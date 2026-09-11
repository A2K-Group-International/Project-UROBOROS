import { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { addSingleAttendee } from "@/services/attendanceService";
import { useUser } from "@/context/useUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { childSchema, parentSchema } from "@/zodSchema/AddFamilySchema";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
const AddAttendee = ({
  attendee_type,
  family_id,
  event_id,
}) => {
  const { userData } = useUser();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const addAttendeeMutation = useMutation({
    mutationFn: async (data) => addSingleAttendee(data),
    onSuccess: () => {
      toast({
        title: "Attendee added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Attendee added successfully",
      });
      console.error(error.message); 
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant:"destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["attendance", event_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["family_add_logs", family_id],
      });
    },
  });

  const addParentSchema = parentSchema.omit({
    time_attended:true,
    time_out: true
  })

  const addChild = childSchema.omit({
    time_attended:true,
    time_out: true
  })

  const form = useForm({
    resolver: zodResolver(
      attendee_type === "parents" ? addParentSchema : addChild
    ),
    defaultValues: {
      first_name: "",
      last_name: "",
      mobile_number: "",
    },
  });

  const onSubmit = (attendeeData) => {

    addAttendeeMutation.mutate({
      attendeeData,
      family_id,
      editedby_id: userData.id,
      attendee_type,
      event_id,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {/* <Button className="" size="sm"> */}
        <button className="hover:cursor-pointer bg-accent p-1 rounded-md">
          <Icon
            className="h-4 w-4 text-white"
            icon="mingcute:add-fill"
          ></Icon>
        </button>
        {/* </Button> */}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add {attendee_type === "parents" ? "Parent/Guardian" : "Child"}
          </DialogTitle>
          <DialogDescription>
            Add a {attendee_type === "parents" ? "Parent/Guardian" : "child"} to{" "}
            this record.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data))}>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field}></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            ></FormField>

            {attendee_type === "parents" && (
              <FormField
                control={form.control}
                dis
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Contact Number" {...field}></Input>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
            )}
            <div className="mt-2 flex justify-end">
              <Button disabled={addAttendeeMutation.isPending} type="submit">{addAttendeeMutation.isPending ? <Loader2/> :"Add" }</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

AddAttendee.propTypes = {
  attendee_type: PropTypes.string.isRequired,
  family_id: PropTypes.string.isRequired,
  event_id: PropTypes.string.isRequired,
};

export default AddAttendee;
