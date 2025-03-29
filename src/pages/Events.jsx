import EventCard from "@/components/Events/EventCard";
import QrScannerEvents from "@/components/Events/QRScannerEvents";
import { Description, Title } from "@/components/Title";

import { getEventsCalendar } from "@/services/eventService";

import { useQuery } from "@tanstack/react-query";
import ParishionerDialogCalendar from "@/components/Events/ParishionerDialogCalendar";
import { useUser } from "@/context/useUser";
import Loading from "@/components/Loading";
import { fetchUserMinistryIds } from "@/services/ministryService";

const Events = () => {
  const { userData } = useUser();

  const { data: ministryIds } = useQuery({
    queryKey: ["ministries", userData?.id],
    queryFn: () => fetchUserMinistryIds(userData?.id),
    enabled: !!userData?.id,
  });

  const { data: parishionerEvents, isLoading } = useQuery({
    queryKey: ["events", ministryIds],
    queryFn: async () => await getEventsCalendar(ministryIds),
    enabled: !!ministryIds,
  });

  return (
    <>
      <Title>Events</Title>
      <Description>Latest upcoming events at the church</Description>
      <div className="no-scrollbar mt-5 flex justify-center gap-x-2 md:justify-start">
        <ParishionerDialogCalendar events={parishionerEvents?.data} />
        <QrScannerEvents eventData={parishionerEvents?.data} />
      </div>
      <div className="mt-5 grid place-items-center justify-center gap-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {isLoading ? (
          <Loading />
        ) : parishionerEvents?.data?.length === 0 ? (
          <p>No Upcoming Events</p>
        ) : (
          parishionerEvents?.data?.map((event, i) => (
            <EventCard
              key={i}
              eventId={event.id}
              eventName={event.event_name}
              eventDescription={event.description}
              eventDate={event.event_date}
              eventTime={event.event_time}
              eventImage={event.image_url}
              requireAttendance={event.requires_attendance}
            />
          ))
        )}
      </div>
    </>
  );
};

export default Events;
