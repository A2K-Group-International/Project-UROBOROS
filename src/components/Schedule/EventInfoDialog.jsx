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
import { useMemo } from "react";
import { formatEventDate, formatEventTime } from "@/lib/utils";

const EventInfoDialog = ({ open, event, eventData, onClose }) => {
  const { userData } = useUser();
  const role = userData?.role;

  // Find the matching event in eventData that corresponds to the current event.id
  const currentEventDetails = useMemo(() => {
    if (!eventData || !Array.isArray(eventData) || !event?.id) return null;

    const matchingEvent = eventData.find((item) => item.id === event.id);
    return matchingEvent || null;
  }, [eventData, event?.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>{currentEventDetails?.event_name}</DialogTitle>
          <DialogDescription>
            <p>Date: {formatEventDate(currentEventDetails?.event_date)}</p>
            {currentEventDetails?.requires_attendance && (
              <p>Time: {formatEventTime(currentEventDetails?.event_time)}</p>
            )}
            <p>
              Description: {event?.description || "No description provided."}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-x-1">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {role === ROLES[2] && currentEventDetails?.requires_attendance && (
            <ManualAttendEvents
              eventId={currentEventDetails?.id}
              eventName={currentEventDetails?.event_name}
              eventTime={currentEventDetails?.event_time}
              eventDate={currentEventDetails?.event_date}
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
  eventData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      event_name: PropTypes.string,
      event_date: PropTypes.string,
      event_time: PropTypes.string,
      event_description: PropTypes.string,
    })
  ),
  onClose: PropTypes.func.isRequired,
  temporaryRole: PropTypes.string,
};

export default EventInfoDialog;
