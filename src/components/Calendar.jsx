import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import PropTypes from "prop-types";
import { useUser } from "@/context/useUser";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetingByCreatorId } from "@/services/meetingService";
import EventInfoDialog from "./Schedule/EventInfoDialog";
import { Button } from "./ui/button";
import { useState } from "react";
// import useEvent from "@/hooks/useEvent";

const Calendar = ({ events }) => {
  // const { calendarEvents } = useEvent();
  const [selectedShowCalendar, setSelectedShowCalendar] = useState("Events");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { userData } = useUser();

  const role = userData?.role;

  const { data: meetings } = useQuery({
    queryKey: ["meetings", userData?.id],
    queryFn: () => fetchMeetingByCreatorId(userData?.id),
    enabled: !!userData?.id,
  });

  // // Make sure getEvents is available and is an array
  // const eventArray = Array.isArray(calendarEvents?.data)
  //   ? calendarEvents.data
  //   : [];
  const safeMeetings = Array.isArray(meetings) ? meetings : [];

  const eventData = events?.map((item) => {
    // Create a default time (e.g., "00:00:00") if time is null
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

  // Event click handler
  const handleEventClick = (info) => {
    const { title, startStr: start, id, extendedProps } = info.event;
    setSelectedEvent({
      title,
      start,
      description: extendedProps.description,
      id,
    });
    setDialogOpen(true);
  };

  return (
    <div className="h-full w-full">
      {role === "admin" && (
        <div className="flex gap-2">
          <Button
            onClick={() => setSelectedShowCalendar("Events")}
            variant={"outline"}
          >
            Events
          </Button>
          <Button
            onClick={() => setSelectedShowCalendar("Meetings")}
            variant={"outline"}
          >
            Meetings
          </Button>
        </div>
      )}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={true}
        events={selectedShowCalendar === "Events" ? eventData : meetingData}
        height="100%"
        contentHeight="auto"
        eventClick={handleEventClick} // Attach click event handler
        eventContent={(arg) => (
          <div className="truncate text-sm">{arg.event.title}</div>
        )} // Customize event content
        displayEventTime={false} // Hide time from display
      />

      <EventInfoDialog
        open={dialogOpen}
        event={selectedEvent}
        eventData={events}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
};

Calendar.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      event_name: PropTypes.string.isRequired,
      event_date: PropTypes.string.isRequired,
      event_time: PropTypes.string,
      event_description: PropTypes.string,
    })
  ),
};

export default Calendar;
