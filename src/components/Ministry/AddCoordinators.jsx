import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Title } from "../Title";
import CustomReactSelect from "../CustomReactSelect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { coordinatorSchema } from "@/zodSchema/CreateMinistrySchema";
import {
  addCoordinators,
  getMinistryCoordinators,
} from "@/services/ministryService";
import { toast } from "@/hooks/use-toast";
import { ROLES } from "@/constants/roles";
import { getUsersByRole } from "@/services/userService";
import PropTypes from "prop-types";
import { useMemo } from "react";

const AddCoordinators = ({ ministryId }) => {
  const { data: coordinators, isLoading: coordinatorLoading } = useQuery({
    queryKey: ["coordinators"],
    queryFn: async () => getUsersByRole(ROLES[0]),
  });
  const queryClient = useQueryClient();
  const { data: volunteers, isLoading: volunteersLoading } = useQuery({
    queryKey: ["volunteer"],
    queryFn: async () => getUsersByRole(ROLES[1]),
  });

  // Query to fetch existing ministry coordinators
  const { data: existingCoordinators } = useQuery({
    queryKey: ["ministryCoordinators", ministryId],
    queryFn: async () => {
      const response = await getMinistryCoordinators(ministryId);
      return response;
    },
    enabled: !!ministryId,
  });

  const adminsCoordinators = [...(volunteers ?? []), ...(coordinators ?? [])];

  // Unique Set of existing coordinator IDs
  const existingCoordinatorIds = useMemo(() => {
    if (!existingCoordinators) return new Set();
    return new Set(
      existingCoordinators?.map((coordinator) => coordinator?.users?.id)
    );
  }, [existingCoordinators]);

  // Filter coordinators to exclude those already assigned to this ministry
  const filteredCoordinatorOptions = useMemo(() => {
    return adminsCoordinators
      .filter((coordinator) => !existingCoordinatorIds.has(coordinator.id))
      .map((coordinator) => ({
        value: coordinator.id,
        label: `${coordinator.first_name} ${coordinator.last_name}`,
      }));
  }, [adminsCoordinators, existingCoordinatorIds]);

  const form = useForm({
    resolver: zodResolver(coordinatorSchema),
    defaultValues: {
      coordinators: [],
    },
  });

  const { mutate } = useMutation({
    mutationFn: addCoordinators,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Coordinators Successfully added",
      });
    },
    onMutate: () => {
      toast({
        title: "Adding coordinators...",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `${error.message}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["ministryCoordinators", ministryId],
      });
      form.reset();
    },
  });

  const onSubmit = ({ coordinators }) => {
    const coordinatorsData = coordinators.map((coordinator) => ({
      ministry_id: ministryId,
      coordinator_id: coordinator,
    }));

    mutate({ ministryId, coordinatorsData });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-lg border-none bg-primary-outline/35 text-accent hover:bg-primary"
        >
          Add Coordinators
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="text-primary-text">
        <AlertDialogHeader>
          <AlertDialogTitle>Add Coordinators</AlertDialogTitle>
          <Title>Input the new coordinators</Title>
          <AlertDialogDescription>
            Assign coordinators to this ministry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="coordinators"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className="font-bold">Name</FormLabel>
                    <FormControl>
                      <CustomReactSelect
                        isLoading={coordinatorLoading || volunteersLoading}
                        options={filteredCoordinatorOptions}
                        value={filteredCoordinatorOptions.filter((option) =>
                          field.value?.includes(option.value)
                        )}
                        onChange={(selectedOptions) =>
                          field.onChange(
                            selectedOptions?.map((option) => option.value) || []
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter className={"mt-2"}>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction type="submit">Done</AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogBody>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AddCoordinators.propTypes = {
  ministryId: PropTypes.string.isRequired,
};

export default AddCoordinators;
