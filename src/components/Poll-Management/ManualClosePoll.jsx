import {
  AlertDialog,
  AlertDialogAction,
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
import usePoll from "@/hooks/usePoll";
import { useState } from "react";
import PropTypes from "prop-types";

const ManualClosePoll = ({ poll_id }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { manualClosePollMutation } = usePoll({ poll_id });

  const { mutate, isPending } = manualClosePollMutation;

  const handleClosePoll = async (poll_id) => {
    mutate(poll_id, {
      onSuccess: () => {
        setDialogOpen(false);
      },
    });
  };
  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" className="rounded-xl">
          <Icon icon="mingcute:close-circle-fill" width={16} height={16} />
          <span className="hidden md:block">Close Poll</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to close this poll?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will set the poll&apos;s status to closed. Users will no
            longer be able to submit votes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleClosePoll(poll_id)}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Icon icon="lucide:loader" className="animate-spin" />
                Closing...
              </span>
            ) : (
              "Close Poll"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ManualClosePoll.propTypes = {
  poll_id: PropTypes.string.isRequired,
};

export default ManualClosePoll;
