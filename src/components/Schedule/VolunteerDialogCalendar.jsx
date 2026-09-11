import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { getEventsCalendar } from "@/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useUser } from "@/context/useUser";
import { fetchUserMinistryIds } from "@/services/ministryService";
import { fetchCalendarMeetings } from "@/services/meetingService";
import EventInfoDialog from "./EventInfoDialog";

const VolunteerDialogCalendar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [eventVisibility, setEventVisibility] = useState("public");
  const [eventType, setEventType] = useState("event"); // Default to "event"
  const [selectedEvent, setSelectedEvent] = useState(null); // Track selected event
  const [dialogOpen, setDialogOpen] = useState(false); // State for the EventInfoDialog

  const { userData } = useUser();

  const { data: meetingResponse } = useQuery({
    queryKey: ["meetings", userData.id],
    queryFn: () => fetchCalendarMeetings(userData.id),
    enabled: !!userData.id,
  });

  // Destructure the data from the response
  const myMeetings = meetingResponse?.data;

  const { data: ministryIds } = useQuery({
    queryKey: ["ministries", userData.id],
    queryFn: () => fetchUserMinistryIds(userData.id),
    enabled: !!userData.id,
  });

  const { data: events } = useQuery({
    queryKey: ["events", ministryIds],
    queryFn: () => getEventsCalendar(ministryIds), // Get all events, private and public
    keepPreviousData: true,
  });

  const formattedEvents =
    events?.data && Array.isArray(events.data)
      ? [
          // Map Events to calendar events
          ...events.data
            .filter((event) =>
              // Filter by event visibility
              eventVisibility === "all"
                ? true
                : event.visibility === eventVisibility
            )
            .filter((event) =>
              // If "Events" is selected, show all events, else filter by event type
              eventType === "all" || eventType === "event"
                ? true
                : event.event_type === eventType
            )
            .map((event) => {
              const startDateTime = `${event.date}T${event.time}`;
              const endDateTime = `${event.date}T${event.time}`;

              return {
                title: event.name,
                start: startDateTime,
                end: endDateTime,
                backgroundColor:
                  event.visibility === "private" ? "#FF5733" : "#33FF57",
                borderColor:
                  event.visibility === "private" ? "#FF5733" : "#33FF57",
                textColor: "#FFFFFF",
                extendedProps: { ...event },
              };
            }),

          // Map Meetings to calendar events (only if "meeting" type is selected)
          ...(eventType === "meeting" || eventType === "all"
            ? (myMeetings || []).map((meeting) => {
                const startDateTime = `${meeting.meeting_date}T${meeting.start_time}`;
                const endDateTime = `${meeting.meeting_date}T${meeting.end_time}`;

                return {
                  title: meeting.meeting_name,
                  start: startDateTime,
                  end: endDateTime,
                  backgroundColor: "#FF5733", // Customize for meetings
                  borderColor: "#FF5733",
                  textColor: "#FFFFFF",
                  extendedProps: { ...meeting },
                };
              })
            : []), // Empty array when "meeting" type is not selected
        ]
      : [];

  // Handle event click
  const handleEventClick = (info) => {
    const { title, startStr: start, extendedProps } = info.event;

    setSelectedEvent({
      title,
      start,
      description: extendedProps.description,
    });
    setDialogOpen(true); // Open the EventInfoDialog
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>Calendar</Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Volunteer Calendar</DialogTitle>
            <DialogDescription>
              View the event schedule for your selected time.
            </DialogDescription>
          </DialogHeader>

          {/* Event Type Filter (Above Public/Private) */}
          <div className="flex space-x-2">
            <Button
              variant={eventType === "event" ? "primary" : "secondary"}
              onClick={() => setEventType("event")}
            >
              Events
            </Button>
            <Button
              variant={eventType === "meeting" ? "primary" : "secondary"}
              onClick={() => setEventType("meeting")}
            >
              Meetings
            </Button>
          </div>

          {/* Event Visibility Filters */}
          <div className="flex flex-wrap space-x-2">
            <Button
              variant={eventVisibility === "all" ? "primary" : "secondary"}
              onClick={() => setEventVisibility("all")}
            >
              All Events
            </Button>
            <Button
              variant={eventVisibility === "public" ? "primary" : "secondary"}
              onClick={() => setEventVisibility("public")}
            >
              Public Events
            </Button>
            <Button
              variant={eventVisibility === "private" ? "primary" : "secondary"}
              onClick={() => setEventVisibility("private")}
            >
              Private Events
            </Button>
          </div>

          {/* FullCalendar */}
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            weekends={true}
            events={formattedEvents || []}
            height="100%"
            contentHeight="auto"
            eventClick={handleEventClick}
            eventContent={(arg) => {
              return <div className="truncate text-sm">{arg.event.title}</div>;
            }}
            displayEventTime={false} // Hides the time from event display
          />
        </DialogContent>
      </Dialog>

      {/* Reusable EventInfoDialog */}
      <EventInfoDialog
        open={dialogOpen}
        event={selectedEvent}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default VolunteerDialogCalendar;
