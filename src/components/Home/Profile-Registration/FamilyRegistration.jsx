import PropTypes from "prop-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFamilySchema } from "@/zodSchema/AddFamilySchema";
import { Label } from "@/components/ui/label";
import { DialogClose } from "../../ui/dialog";
import { useUser } from "@/context/useUser";
import { useAddFamily } from "@/hooks/useFamily";

const FamilyRegistration = ({ skipBtn, closeModal }) => {
  const { regData } = useUser(); // Access registration data

  // Use `regData` to prepopulate the first parent
  const form = useForm({
    resolver: zodResolver(addFamilySchema),
    defaultValues: {
      parents: [
        {
          firstName: "",
          lastName: "",
          contactNumber: "",
        },
      ],
      children: [{ firstName: "", lastName: "" }],
    },
  });

  const {
    fields: parentFields,
    append: appendParent,
    remove: removeParent,
  } = useFieldArray({
    control: form.control,
    name: "parents",
  });

  const {
    fields: childFields,
    append: appendChild,
    remove: removeChild,
  } = useFieldArray({
    control: form.control,
    name: "children",
  });
  const { mutate, isLoading } = useAddFamily();

  const onSubmit = async (data) => {
    try {
      const familyData = {
        parents: data.parents,
        children: data.children,
        familyId: regData?.familyId, // Use `regData` for family ID
      };

      await mutate(familyData);

      closeModal(false); // Close the modal if it's successful
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <Label>Co-Parent/Guardian Information</Label>
        {parentFields.map((parent, index) => (
          <div
            key={parent.id}
            className="flex w-full flex-col gap-2 md:flex-row"
          >
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`parents.${index}.firstName`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`parents.${index}.lastName`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`parents.${index}.contactNumber`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Contact Tel No." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => appendParent({ firstName: "", lastName: "" })}
          >
            Add
          </Button>
        </div>

        <Label>Child Information</Label>
        {childFields.map((child, index) => (
          <div
            key={child.id}
            className="flex w-full flex-col gap-2 md:flex-row"
          >
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`children.${index}.firstName`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`children.${index}.lastName`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => appendChild({ firstName: "", lastName: "" })}
          >
            Add
          </Button>
        </div>

        <div className="flex justify-end gap-x-2">
          {/* Skip Button */}
          {
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={skipBtn}>
                Skip
              </Button>
            </DialogClose>
          }

          <Button
            variant="primary"
            type="submit"
            disabled={isLoading || form.formState.isSubmitting}
          >
            {isLoading || form.formState.isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Props validation
FamilyRegistration.propTypes = {
  skipBtn: PropTypes.func, // Require skipBtn to be a function, made optional here
  closeModal: PropTypes.func,
};

export default FamilyRegistration;
