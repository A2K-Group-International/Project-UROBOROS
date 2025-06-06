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
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resendEmailConfirmation } from "@/services/authService";
import { toast } from "@/hooks/use-toast";

const FamilyRegistration = ({ skipBtn, closeModal, email }) => {
  const { regData } = useUser();
  const [cooldown, setCooldown] = useState(60);
  const [isCooldownActive, setCooldownActive] = useState(false);

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

  useEffect(() => {
    // Cooldown logic
    let timer;
    if (isCooldownActive && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCooldownActive(false);
            return 60; // Reset cooldown
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isCooldownActive) {
      clearInterval(timer);
    }
    return () => clearInterval(timer); // Cleanup on unmount
  }, [cooldown, isCooldownActive]);

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

  const { mutate: resendMutate, isPending: resendIsPending } = useMutation({
    mutationFn: resendEmailConfirmation,
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Email confirmation has been resent successfully.",
      });
      setCooldown(60);
      setCooldownActive(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend email confirmation.",
      });
    },
  });

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
        <div className="mt-4 rounded-md border border-accent/30 bg-primary/50 p-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-accent">
              Didn&apos;t receive the confirmation email?
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isCooldownActive || resendIsPending}
              onClick={() => {
                resendMutate(email);
              }}
              className="w-full sm:w-auto"
            >
              {resendIsPending ? (
                <>
                  <Icon
                    className="mr-2 h-4 w-4 animate-spin"
                    icon={"mingcute:loading-line"}
                  />
                  Resending...
                </>
              ) : isCooldownActive ? (
                `Resend in ${cooldown}s`
              ) : (
                <>
                  <Icon
                    icon="mingcute:mail-send-line"
                    className="mr-2 h-4 w-4"
                  />
                  Resend Confirmation
                </>
              )}
            </Button>
          </div>
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
  email: PropTypes.string.isRequired, // Require email to be a string
};

export default FamilyRegistration;
