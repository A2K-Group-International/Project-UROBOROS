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
import { Button } from "../ui/button";
import { parseISO, format, setHours, setMinutes } from "date-fns";
import PropTypes from "prop-types";
import usePoll from "@/hooks/usePoll";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const FinalizePoll = ({ pollId, pollDate, pollTime }) => {
  const [open, setOpen] = useState(false);
  const { finalizePollMutation } = usePoll({ poll_id: pollId });

  const formatDateTime = (dateStr, timeStr) => {
    try {
      const date = parseISO(dateStr); // e.g. "2025-07-02T16:00:00+00:00"
      const [hour, minute] = timeStr.split(":").map(Number);

      const dateWithTime = setMinutes(setHours(date, hour), minute);

      return format(dateWithTime, "MMMM dd, yyyy h:mmaaa"); // e.g. July 03, 2025 5:11PM
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date/time";
    }
  };

  // Format the date/time once outside of the JSX
  const formattedDateTime =
    pollDate && pollTime ? formatDateTime(pollDate, pollTime) : "selected time";

  const handleFinalize = (e) => {
    e.preventDefault();
    finalizePollMutation.mutate(
      { pollDate, pollTime },
      {
        onSuccess: () => {
          setOpen(false); // Close the dialog on success
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-full bg-primary text-[14px] text-accent">
          Finalise and send announcement
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will finalise the poll results for{" "}
            <strong>{formattedDateTime}</strong> and send an announcement to all
            participants. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <Button
            onClick={handleFinalize}
            disabled={finalizePollMutation.isPending}
            className="flex-1"
          >
            {finalizePollMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finalising...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

FinalizePoll.propTypes = {
  pollDate: PropTypes.string.isRequired, // ISO date string
  pollTime: PropTypes.string.isRequired, // "HH:mm" format
  pollId: PropTypes.string.isRequired, // Poll ID for finalization
};

export default FinalizePoll;
