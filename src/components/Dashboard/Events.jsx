import useEventCalendar from "@/hooks/useEventCalendar";
import { fetchSelectedEvents } from "@/services/eventService";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import React from "react";
import PropTypes from "prop-types";

const Events = () => {
  const { activeDate } = useEventCalendar();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["events", activeDate],
    queryFn: () => fetchSelectedEvents(activeDate),
  });

  if (!data || data?.allDayEvents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl bg-white p-5">
        <h1 className="text-xl font-semibold text-accent">No Events Found</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full rounded-xl bg-white p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="mb-2 h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <h1 className="text-2xl font-semibold text-accent">{`${error}`}</h1>
      </div>
    );
  }
  const DateCard = React.forwardRef(({ title, status, time }, ref) => (
    <div
      ref={ref}
      className={cn("mb-2 rounded-lg bg-primary px-4 py-1", {
        "border border-dashed border-accent": status === "All Day",
        "bg-accent": status === "Ongoing",
      })}
    >
      <div className="flex justify-between">
        <p
          className={cn("font-bold text-accent", {
            "line-through": status === "Done",
          })}
        >
          {title}
        </p>
        <p className="text-xs text-accent/75">{status}</p>
      </div>
      <p className="text-xs text-accent">{time}</p>
    </div>
  ));
  DateCard.displayName = "DateCard";

  DateCard.propTypes = {
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    time: PropTypes.string,
  };

  return (
    <div className="h-full rounded-xl bg-white p-5">
      <p className="mb-2 font-bold text-accent">Events Today</p>
      {data.allDayEvents.map((date, index) => (
        <DateCard
          key={index}
          title={date.event_name}
          status={date.status}
          time={date.event_time}
        />
      ))}

      {data.otherEvents.length > 0 && data.allDayEvents.length > 0 && (
        <Separator className="mb-2" />
      )}
      {data.otherEvents && (
        <>
          {data?.otherEvents.map((date, index) => (
            <DateCard
              key={index}
              title={date.event_name}
              status={date.status}
              time={date.event_time}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Events;
