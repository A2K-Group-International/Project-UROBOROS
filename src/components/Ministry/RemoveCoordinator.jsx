import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeCoordinator } from "@/services/ministryService";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import PropTypes from "prop-types";
import { Button } from "../ui/button";

const RemoveCoordinator = ({ coordinator_id, ministryId }) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: removeCoordinator,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ministryCoordinators", ministryId],
      });
      toast({
        title: "Coordinator removed",
        description: "Coordinator has been deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing coordinator",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Icon icon="mingcute:minus-circle-fill" height="20" color="#663E2F" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to remove this coordinator?
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => mutate({ ministryId, coordinator_id })}
            className="flex-1"
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
RemoveCoordinator.propTypes = {
  coordinator_id: PropTypes.string.isRequired,
  ministryId: PropTypes.string.isRequired,
};

export default RemoveCoordinator;
