import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import useMinistry from "@/hooks/useMinistry";
import { editMinistrySchema } from "@/zodSchema/EditMinistrySchema";
// import AssignVolunteerComboBox from "../Schedule/AssignVolunteerComboBox";
// import { useQuery } from "@tanstack/react-query";
// import { ROLES } from "@/constants/roles";
// import { getUsersByRole } from "@/services/userService";

const EditMinistry = ({
  ministryId,
  // coordinators,
  currentName,
  currentDescription,
  isOpen, // Use the isOpen prop passed from MinistryCard
  closeDialog, // Use the closeDialog function passed from MinistryCard
}) => {
  // const currentCoordinators =  coordinators.map((coordinator) => coordinator.users.id)
  const form = useForm({
    resolver: zodResolver(editMinistrySchema),
    defaultValues: {
      // coordinators: currentCoordinators,
      ministryName: currentName,
      ministryDescription: currentDescription,
    },
  });
  const { editMutation } = useMinistry({ ministryId }); // Use the hook

  // const { data } = useQuery({
  //   queryKey: ["admins"],
  //   queryFn: async () => getUsersByRole(ROLES[0]),
  // });

  // const adminOptions = data?.map((admin) => ({
  //   value: admin.id,
  //   label: `${admin.first_name} ${admin.last_name}`,
  // }));

  const onSubmit = (values) => {
    // Call the editMinistry service with the values directly

    editMutation.mutate({
      ministryId,
      // coordinators: values.coordinators,
      ministry_name: values.ministryName,
      ministry_description: values.ministryDescription,
    });

    // Close the dialog after submitting the form
    closeDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>
            Update the details of your group. Changes will be saved immediately.
          </DialogDescription>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-2 text-start"
            >
              {/* <FormField
                control={form.control}
                name="coordinators"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coordinators</FormLabel>
                    <FormControl>
                      <AssignVolunteerComboBox
                        placeholder="Select Coordinators"
                        value={field.value || []}
                        onChange={(value) => field.onChange(value)}
                        options={adminOptions}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="ministryName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Group Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the public name of the group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ministryDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description
                      <span className="font-light italic">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Maximum of 128 characters"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-x-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={editMutation.isPending}>
                  {editMutation.isPending ? "Updating..." : "Submit"}
                </Button>
              </div>
              {editMutation.isError && (
                <p className="text-red-500">
                  Error:{" "}
                  {editMutation.isError?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

// Add PropTypes validation
EditMinistry.propTypes = {
  ministryId: PropTypes.string.isRequired,
  currentName: PropTypes.string.isRequired,
  currentDescription: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  closeDialog: PropTypes.func.isRequired,
  // coordinators: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     users: PropTypes.shape({
  //       id: PropTypes.string.isRequired,
  //     }).isRequired,
  //   })
  // ).isRequired,
};

export default EditMinistry;
