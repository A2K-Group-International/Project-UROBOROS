import EventCard from "@/components/Events/EventCard";
import QrScannerEvents from "@/components/Events/QRScannerEvents";
import { Description, Title } from "@/components/Title";
import { Button } from "@/components/ui/button";

import ParishionerDialogCalendar from "@/components/Events/ParishionerDialogCalendar";
import { useUser } from "@/context/useUser";
import Loading from "@/components/Loading";
import { useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { useEventsCalendar } from "@/hooks/useEventsCalendar";

const Events = () => {
  const { userData } = useUser();
  const loadMoreRef = useRef(null);

  const {
    events,
    calendarEvents,
    isLoading,
    isFetchingNextPage,
    isEmpty,
    canLoadMore,
    fetchNextPage,
    error,
  } = useEventsCalendar({
    userId: userData?.id,
    limit: 12,
    enabled: !!userData?.id,
  });

  // Infinite scroll implementation
  const handleLoadMore = useCallback(() => {
    if (canLoadMore) {
      fetchNextPage();
    }
  }, [canLoadMore, fetchNextPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore, canLoadMore]);

  return (
    <>
      <Title>Events</Title>
      <Description>Upcoming church events</Description>

      <div className="no-scrollbar mt-5 flex justify-stretch gap-x-2 md:justify-start">
        <ParishionerDialogCalendar events={calendarEvents} />
        <QrScannerEvents eventData={events} />
      </div>

      {/* Events Grid */}
      <div className="mt-5 grid place-items-center justify-center gap-3 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center">
            <Loading />
          </div>
        ) : isEmpty ? (
          <div className="col-span-full py-8 text-center">
            <Icon
              icon="mingcute:calendar-line"
              className="text-muted-foreground mx-auto mb-2 h-12 w-12"
            />
            <p className="text-muted-foreground">No upcoming events</p>
            {error && (
              <p className="mt-2 text-sm text-red-500">
                Error loading events. Please try again.
              </p>
            )}
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
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

      {/* Infinite Scroll Trigger */}
      {canLoadMore && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            className="min-w-[120px]"
          >
            {isFetchingNextPage ? (
              <>
                <Icon
                  icon="mingcute:loading-3-line"
                  className="mr-2 h-4 w-4 animate-spin"
                />
                Loading...
              </>
            ) : (
              <>
                <Icon icon="mingcute:refresh-line" className="mr-2 h-4 w-4" />
                Load More
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default Events;
