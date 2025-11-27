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
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useDeleteAttendance } from "@/hooks/Schedule/useDeleteAttendance";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

const DeleteAttendeeDialog = ({ attendeeId, disableSchedule }) => {
  const { mutate: deleteAttendance, isPending } = useDeleteAttendance();

  const handleDelete = () => {
    deleteAttendance(attendeeId);
  };

  return (
    <AlertDialog>
      {!disableSchedule && (
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost">
            <Icon
              icon="mingcute:delete-2-line"
              className="h-5 w-5 text-red-500"
            />
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            attendance record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-700"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeleteAttendeeDialog.propTypes = {
  attendeeId: PropTypes.string.isRequired,
  disableSchedule: PropTypes.bool,
};

export default DeleteAttendeeDialog;
