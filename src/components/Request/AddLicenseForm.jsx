import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomReactSelect from "../CustomReactSelect";
import { Input } from "../ui/input";
import useLicense from "@/hooks/useLicense";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/services/userService";
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
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

const AddLicenseForm = ({ status }) => {
  const [licenseOpen, setLicenseOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userOptions"],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 10,
  });
  const { form, onSubmit, isPending } = useLicense({
    status,
    setLicenseOpen,
  });

  const selectOptions =
    data?.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.email})`,
    })) || [];

  if (isError) {
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <AlertDialog open={licenseOpen} onOpenChange={setLicenseOpen}>
      <AlertDialogTrigger className="rounded-3xl" asChild>
        <Button>
          <Icon icon={"mingcute:idcard-fill"} className="h-6 w-6" />
          Assign New License
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Assign New License</AlertDialogTitle>
          <AlertDialogDescription>
            Assign a new license to a user profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              id="add-license-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <CustomReactSelect
                        initialValue={null}
                        value={
                          selectOptions.find(
                            (option) => option.value === field.value
                          ) || null
                        }
                        onChange={(selectedOption) => {
                          field.onChange(selectedOption?.value || null);
                        }}
                        options={selectOptions}
                        isLoading={isLoading}
                        isMulti={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter license code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            className="flex-1"
            type="submit"
            form="add-license-form"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Assign License"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AddLicenseForm.propTypes = {
  status: PropTypes.string.isRequired,
};

export default AddLicenseForm;
