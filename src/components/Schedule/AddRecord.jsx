import { useState } from "react";
import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { addRecordSchema } from "@/zodSchema/Schedule/AddRecordSchema";
import { useAddRecord } from "@/hooks/Schedule/useAddRecord";
import { useLocation } from "react-router-dom";
import { useUser } from "@/context/useUser";
import { z } from "zod";

import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

const AddRecord = ({ eventId }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const location = useLocation();
  const { userData } = useUser();
  const locationIsSchedule = location.pathname === "/schedule";
  const addRecordByAdmin = z.object({
    parents: z
      .array(
        z.object({
          parentFirstName: stringWithWhitespaceValidation("Parent's first name").transform(capitalizeName),
          parentLastName: stringWithWhitespaceValidation("Parent's last name").transform(capitalizeName),
          parentContactNumber: ukPhoneNumberValidation(),
          isMainApplicant: z.boolean(),
        })
      )
      .optional()
      .refine(
        (parents) => {
          // Skip validation if no parents or empty array
          if (!parents || parents.length === 0) return true;

          // Validate that there is exactly one main applicant
          const mainApplicants = parents.filter(
            (parent) => parent.isMainApplicant
          );
          return mainApplicants.length === 1;
        },
        {
          message: "There must be exactly one main applicant",
          path: ["parents"],
        }
      ),
    children: z
      .array(
        z.object({
          childFirstName: stringWithWhitespaceValidation("Child's first name").transform(capitalizeName),
          childLastName: stringWithWhitespaceValidation("Child's last name").transform(capitalizeName),
        })
      )
      .min(1, "At least one child is required"),
  });

  const form = useForm({
    resolver: zodResolver(
      locationIsSchedule ? addRecordByAdmin : addRecordSchema
    ),
    defaultValues: {
      parents: locationIsSchedule
        ? []
        : [
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

  const { mutate: registerAttendance, isLoading } = useAddRecord({ eventId }); // Initialize the mutation hook

  const onSubmit = (values) => {
    // Proceed with submission
    const { parents, children } = values;

    const submitData = {
      event: eventId,
      parents:
        parents?.map((parent) => ({
          parentFirstName: parent.parentFirstName,
          parentLastName: parent.parentLastName,
          parentContactNumber: parent.parentContactNumber,
          isMainApplicant: parent.isMainApplicant,
        })) || [],
      children: children.map((child) => ({
        childFirstName: child.childFirstName,
        childLastName: child.childLastName,
      })),
      registered_by: userData?.id,
    };

    registerAttendance(submitData);

    // Close the dialog after success
    setOpenDialog(false);
  };

  const handleReset = () => {
    form.reset();
  };

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

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button onClick={handleReset}>
          <Icon icon={"mingcute:classify-add-2-fill"} />
          <p>Add Record Manually</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar max-h-[35rem] overflow-scroll">
        <DialogHeader>
          <DialogTitle>Add New Record</DialogTitle>
          <DialogDescription>Add new record for this event.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              {/* Parent Guardian Field */}
              <Label className="text-lg">
                Parent/Guardian Information{" "}
                {locationIsSchedule && (
                  <span className="text-xs text-zinc-400">(Optional)</span>
                )}
              </Label>
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

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeParent(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {/* Button to add another parent/guardian */}
              {form?.formState.errors?.parents?.parents && (
                <p className="text-red-600">
                  {form?.formState.errors?.parents?.parents?.message}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" size="sm" onClick={addParentField}>
                  Add
                </Button>
              </div>
              <Label className="text-lg">Child Information </Label>
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
  );
};

AddRecord.propTypes = {
  eventId: PropTypes.string,
};

export default AddRecord;
