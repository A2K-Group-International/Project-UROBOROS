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

const AddLicenseForm = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userOptions"],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 10,
  });
  const { form, onSubmit } = useLicense({});

  const selectOptions =
    data?.map((user) => ({
      value: user.email,
      label: `${user.first_name} ${user.last_name} (${user.email})`,
    })) || [];

  if (isError) {
    return <div>Error loading users: {error.message}</div>;
  }
  console.log("form data", form.getValues());
  return (
    <Form {...form}>
      <form
        id="add-license-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
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
          name="groupCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Code</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default AddLicenseForm;
