import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PropTypes from "prop-types";
import { useUser } from "@/context/useUser";
import ManualAttendEvents from "../Events/ManualAttendEvents";
import { ROLES } from "@/constants/roles";
// import { formatEventTime, formatEventDate } from "@/lib/utils";

const EventInfoDialog = ({ open, event, onClose }) => {
  const { userData } = useUser();
  const role = userData?.role;

  const formatUKDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatUKTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>{event?.title}</DialogTitle>
          <DialogDescription>
            <p>Date: {formatUKDate(event?.start)}</p>
            <p>Time: {formatUKTime(event?.start)}</p>
            <p>
              Description: {event?.description || "No description provided."}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-x-1">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {role === ROLES[2] && (
            <ManualAttendEvents
              eventId={event?.id}
              eventName={event?.title}
              // eventTime={formattedEventTime}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

EventInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  event: PropTypes.shape({
    title: PropTypes.string,
    start: PropTypes.string,
    description: PropTypes.string,
    id: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  temporaryRole: PropTypes.string,
};

export default EventInfoDialog;
