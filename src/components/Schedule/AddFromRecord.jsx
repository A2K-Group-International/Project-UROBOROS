import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { existingRecordSchema } from "@/zodSchema/AddFamilySchema";
import { useQuery } from "@tanstack/react-query";
import {
  fetchChildrenAttendanceHistory,
  fetchParentAttendanceHistory,
} from "@/services/attendanceService";
import AssignVolunteerComboBox from "./AssignVolunteerComboBox";
import useAddRecord from "@/hooks/Schedule/useAddRecord";
import { useUser } from "@/context/useUser";
import PropTypes from "prop-types";

const AddFromRecord = ({ eventId, name }) => {
  const [open, setOpen] = useState(false);
  const { userData } = useUser();
  const form = useForm({
    resolver: zodResolver(existingRecordSchema),
    defaultValues: {
      parents: [],
      children: [],
    },
  });

  const { data: parentData, isLoading: isParentLoading } = useQuery({
    queryKey: ["parents", name],
    queryFn: async () => fetchParentAttendanceHistory(name),
  });

  const { data: childrenData, isLoading: isChildLoading } = useQuery({
    queryKey: ["children", name],
    queryFn: async () => fetchChildrenAttendanceHistory(name),
  });

  const parentOptions = useMemo(() => {
    return Array.isArray(parentData)
      ? parentData.map((parent) => ({
          id: parent.id,
          value: parent,
          label: `${parent.first_name} ${parent.last_name}`,
        }))
      : [];
  }, [parentData]);

  const childOptions = useMemo(() => {
    return Array.isArray(childrenData)
      ? childrenData.map((child) => ({
          id: child.id,
          value: child,
          label: `${child.first_name} ${child.last_name}`,
        }))
      : [];
  }, [childrenData]);

  const mutation = useAddRecord({ eventId });

  const onSubmit = (values) => {
    mutation.mutate({
      event: eventId,
      parents: values.parents.map((parent) => ({
        parentFirstName: parent.first_name,
        parentLastName: parent.last_name,
        parentContactNumber: parent.mobile_number,
      })),
      children: values.children.map((child) => ({
        childFirstName: child.first_name,
        childLastName: child.last_name,
      })),
      registered_by: userData.id,
    });
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add From Attendance Record</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-accent">
            Add From Existing Attendance Record
          </DialogTitle>
          <DialogDescription>
            Add a new record from the existing family in the database.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="parents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Parents
                    <span className="text-xs text-zinc-400">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <AssignVolunteerComboBox
                      isLoading={isParentLoading}
                      options={parentOptions}
                      value={field.value}
                      onChange={(selectedParents) => {
                        field.onChange(selectedParents);
                      }}
                      placeholder="Select Parents"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Children</FormLabel>
                  <FormControl>
                    <AssignVolunteerComboBox
                      isLoading={isChildLoading}
                      options={childOptions}
                      value={field.value}
                      onChange={(selectedChildren) => {
                        field.onChange(selectedChildren);
                      }}
                      placeholder="Select Children"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={() => form.reset()} type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" variant="outline">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

AddFromRecord.propTypes = {
  eventId: PropTypes.string,
  name: PropTypes.string,
};

export default AddFromRecord;
