import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useUser } from "@/context/useUser";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetingByCreatorId } from "@/services/meetingService";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";
import useEvent from "@/hooks/useEvent";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// EventInfoDialog component embedded here
const EventInfoDialog = ({ open, event, eventData, onClose }) => {
  // Find the matching event in eventData
  const currentEventDetails = useMemo(() => {
    if (!eventData || !Array.isArray(eventData) || !event?.id) return null;

    const matchingEvent = eventData.find((item) => item.id === event.id);
    return matchingEvent || null;
  }, [eventData, event?.id]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>
            {currentEventDetails?.event_name ||
              currentEventDetails?.meeting_name}
          </DialogTitle>
          <DialogDescription>
            <p>
              Date:{" "}
              {formatEventDate(
                currentEventDetails?.event_date ||
                  currentEventDetails?.meeting_date
              )}
            </p>
            {currentEventDetails?.requires_attendance && (
              <p>
                Time:{" "}
                {formatEventTime(
                  currentEventDetails?.event_time ||
                    currentEventDetails?.start_time
                )}
              </p>
            )}
            <p>
              Description:{" "}
              {event?.description ||
                currentEventDetails?.event_description ||
                currentEventDetails?.meeting_description ||
                "No description provided."}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-end gap-x-1">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
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
  eventData: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  temporaryRole: PropTypes.string,
};

// Main DashboardCalendar component
const DashboardCalendar = () => {
  const [selectedShowCalendar, setSelectedShowCalendar] = useState("Events");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { userData } = useUser();
  const { creatorEventId } = useEvent(userData?.id);

  const temporaryRole = localStorage.getItem("temporaryRole");

  const { data: meetings } = useQuery({
    queryKey: ["meetings", userData?.id],
    queryFn: () => fetchMeetingByCreatorId(userData?.id),
    enabled: !!userData?.id,
  });

  const safeMeetings = Array.isArray(meetings) ? meetings : [];
  const safeEvents = Array.isArray(creatorEventId) ? creatorEventId : [];

  const eventData = safeEvents.map((item) => {
    const eventTime = item.event_time || "00:00:00";

    return {
      title: item.event_name,
      start: `${item.event_date}T${eventTime}`,
      description: item.event_description,
      id: item.id,
    };
  });

  const meetingData = safeMeetings.map((meeting) => ({
    title: meeting.meeting_name,
    start: `${meeting.meeting_date}T${meeting.start_time}`,
    description: meeting.meeting_description,
    id: meeting.id,
  }));

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  if (!userData) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setSelectedShowCalendar("Events")}
          variant={selectedShowCalendar === "Events" ? "primary" : "outline"}
        >
          Events
        </Button>
        <Button
          onClick={() => setSelectedShowCalendar("Meetings")}
          variant={selectedShowCalendar === "Meetings" ? "primary" : "outline"}
        >
          Meetings
        </Button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        events={selectedShowCalendar === "Events" ? eventData : meetingData}
        height="100%"
        contentHeight="auto"
        eventContent={(arg) => (
          <div className="cursor-pointer truncate text-sm hover:bg-opacity-80">
            {arg.event.title}
          </div>
        )}
        displayEventTime={false}
        eventClick={handleEventClick}
      />

      {selectedEvent && (
        <EventInfoDialog
          open={isDialogOpen}
          event={selectedEvent}
          eventData={
            selectedShowCalendar === "Events" ? safeEvents : safeMeetings
          }
          onClose={handleDialogClose}
          temporaryRole={temporaryRole}
        />
      )}
    </div>
  );
};

export default DashboardCalendar;
