import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Title, Description } from "@/components/Title";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import CreateMeeting from "@/components/Schedule/CreateMeeting";
import { Skeleton } from "@/components/ui/skeleton";
import ScheduleDetails from "@/components/Schedule/ScheduleDetails";
import { getEvents } from "@/services/eventService";
import { getMeetings } from "@/services/meetingService";
import { useUser } from "@/context/useUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Search } from "@/assets/icons/icons";
import { ROLES } from "@/constants/roles";

import MeetingDetails from "@/components/Schedule/MeetingDetails";
import useInterObserver from "@/hooks/useInterObserver";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import VolunteerDialogCalendar from "@/components/Schedule/VolunteerDialogCalendar";
import { useDebounce } from "@/hooks/useDebounce";
import ScheduleCards from "@/components/Schedule/ScheduleCards";
import MeetingCards from "@/components/Schedule/MeetingCards";
import NewCreateEventForm from "@/components/Schedule/NewCreateEvent";

const Schedule = () => {
  const [sheetEditDialogOpenIndex, setSheetEditDialogOpenIndex] =
    useState(false);
  const [editDialogOpenIndex, setEditDialogOpenIndex] = useState(null);
  const [urlPrms, setUrlPrms] = useSearchParams();
  const [filter, setFilter] = useState(
    urlPrms.get("filter")?.toString() || "events"
  );
  // const [eventFilter, setEventFilter] = useState(
  //   urlPrms.get("event")?.toString() || "all"
  // );

  const { userData } = useUser();
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: [
      "schedules",
      filter,
      urlPrms.get("query")?.toString() || "",
      userData?.id,
      userData?.role,
      urlPrms.get("year")?.toString(),
      urlPrms.get("month")?.toString(),
      urlPrms.get("eventFilter")?.toString() || "all",
    ],
    queryFn: async ({ pageParam }) => {
      let response;
      if (filter === "events") {
        response = await getEvents({
          page: pageParam,
          query: urlPrms.get("query")?.toString() || "",
          pageSize: 10,
          role: userData?.role,
          userId: userData.id,
          eventFilter: urlPrms.get("eventFilter")?.toString() || "all",
          selectedYear: Number(urlPrms.get("year")),
          selectedMonth: Number(urlPrms.get("month")?.toString()),
        });
      } else if (filter === "meetings") {
        response = await getMeetings({
          page: pageParam,
          query: urlPrms.get("query")?.toString() || "",
          pageSize: 10,
          user: userData,
          selectedYear: Number(urlPrms.get("year")),
          selectedMonth: Number(urlPrms.get("month")?.toString()),
        });
      }
      return response;
    },
    enabled: !!userData,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.nextPage ? lastPage.currentPage + 1 : undefined,
  });
  const { ref } = useInterObserver(fetchNextPage);
  const [query, setQuery] = useState(urlPrms.get("query")?.toString() || "");
  const debouncedSearch = useDebounce(query, 600);

  const onQuery = (e) => {
    setQuery(e.target.value);
  };
  useEffect(() => {
    if (!urlPrms.get("filter")) {
      urlPrms.set("filter", "events");
    }
    if (!urlPrms.get("year")) {
      urlPrms.set("year", new Date().getFullYear());
    }
    if (!urlPrms.get("month")) {
      urlPrms.set("month", new Date().getMonth() + 1);
    }
    if (query === "") {
      urlPrms.delete("query");
    } else {
      urlPrms.set("query", debouncedSearch);
    }

    setUrlPrms(urlPrms);
  }, [debouncedSearch, query, urlPrms, setUrlPrms]);
  const onEventClick = useCallback(
    (eventId) => {
      urlPrms.set("event", eventId);
      urlPrms.delete("meeting");
      setUrlPrms(urlPrms);
    },
    [urlPrms, setUrlPrms]
  );

  const onMeetingClick = useCallback(
    (meetingId) => {
      urlPrms.set("meeting", meetingId);
      urlPrms.delete("event");
      setUrlPrms(urlPrms);
    },
    [urlPrms, setUrlPrms]
  );

  const onFilterChange = (value) => {
    urlPrms.set("filter", value);
    setUrlPrms(urlPrms);
    setFilter(value);
  };

  const onEventFilter = (value) => {
    urlPrms.set("eventFilter", value);
    urlPrms.delete("meeting");
    setUrlPrms(urlPrms);
  };

  return (
    <div className="flex h-full w-full xl:gap-8">
      <div className="no-scrollbar flex w-full flex-col gap-8 overflow-y-auto lg:min-w-[400px] xl:flex-1">
        <div className="flex items-center justify-between">
          <div>
            <Title>
              {userData?.role === ROLES[1] ? "Assigned Events" : "Scheduler"}
            </Title>
            <Description>
              {userData?.role === ROLES[1]
                ? "View events assigned to you."
                : "Manage schedules for your organisation."}
            </Description>
          </div>
          {/* {userData?.role === ROLES[1] && <VolunteerDialogCalendar />} */}
        </div>
        <div className="flex flex-col gap-3">
          {(userData?.role === ROLES[0] || userData?.role === ROLES[4]) && (
            <div className="flex gap-1">
              <NewCreateEventForm />
              <CreateMeeting />
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 transform text-2xl text-accent" />
            <Input
              value={query}
              defaultValue={urlPrms.get("query")?.toString()}
              onChange={onQuery}
              className="border-none pl-12"
              placeholder="Search schedules"
            />
          </div>
          {/* </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form> */}
          <div>
            <p className="mb-3 font-montserrat font-semibold text-accent">
              Filters
            </p>
            <ToggleGroup
              type="single"
              className="flex flex-wrap justify-start gap-2 font-montserrat"
              onValueChange={onFilterChange}
              value={filter}
            >
              <ToggleGroupItem value="events" variant="outline">
                Events
              </ToggleGroupItem>
              <ToggleGroupItem value="meetings" variant="outline">
                Meetings
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <p className="mb-3 font-montserrat font-semibold text-accent">
              Year and Month
            </p>
            <div className="flex gap-2">
              {/* Month Selector */}
              <Select
                value={urlPrms.get("month")}
                onValueChange={(value) => {
                  urlPrms.set("month", value);
                  setUrlPrms(urlPrms);
                }}
              >
                <SelectTrigger className="font-montserrat text-lg">
                  <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Date(0, month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Selector */}
              <Select
                value={urlPrms.get("year")}
                onValueChange={(value) => {
                  urlPrms.set("year", value);
                  setUrlPrms(urlPrms);
                }}
              >
                <SelectTrigger className="font-montserrat text-lg">
                  <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(5).keys()].map((offset) => {
                    const year = new Date().getFullYear() - 2 + offset;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>{" "}
              </Select>
            </div>
          </div>

          {filter === "events" &&
            (userData?.role === ROLES[0] || userData?.role === ROLES[4]) && (
              <div>
                <p className="mb-3 font-montserrat font-semibold text-accent">
                  Schedules
                </p>{" "}
                <Select
                  value={
                    urlPrms.get("eventFilter")?.toString() ||
                    (userData?.role === "admin" ? "all" : "ministry")
                  }
                  onValueChange={onEventFilter}
                >
                  <SelectTrigger className="w-[50%]">
                    <SelectValue placeholder="Filter events " />
                  </SelectTrigger>
                  <SelectContent>
                    {userData?.role === "admin" && (
                      <>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="public">Public Events</SelectItem>
                        <SelectItem value="private">Private Events</SelectItem>
                      </>
                    )}
                    <SelectItem value="assigned">My Assignments</SelectItem>
                    <SelectItem value="ministry">My Ministry</SelectItem>
                    <SelectItem value="owned">Created by Me</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

          <div>
            <div className="flex h-full flex-col gap-2">
              {isLoading ? (
                <Skeleton className="flex h-[85px] w-full rounded-xl bg-primary" />
              ) : data?.pages?.flatMap((page, i) =>
                  filter === "events"
                    ? page?.items?.map((event, j) => (
                        <ScheduleCards
                          editDialogOpenIndex={editDialogOpenIndex}
                          setEditDialogOpenIndex={setEditDialogOpenIndex}
                          key={`${i}-${j}`}
                          urlPrms={urlPrms}
                          event={event}
                          onEventClick={onEventClick}
                          filter={filter}
                          setSheetEditDialogOpenIndex={
                            setSheetEditDialogOpenIndex
                          }
                          sheetEditDialogOpenIndex={sheetEditDialogOpenIndex}
                          i={i}
                          j={j}
                        />
                      ))
                    : page?.items?.map((meeting, j) => (
                        <div key={`${i}-${j}`} className="relative">
                          <Sheet className="">
                            <SheetTrigger asChild></SheetTrigger>
                            <SheetContent className="w-full sm:max-w-full md:w-full lg:hidden">
                              {urlPrms.get("meeting") && <MeetingDetails />}
                            </SheetContent>
                          </Sheet>
                        </div>
                      ))
                )?.length > 0 ? (
                data?.pages?.flatMap((page, i) =>
                  filter === "events"
                    ? page?.items?.map((event, j) => (
                        <ScheduleCards
                          editDialogOpenIndex={editDialogOpenIndex}
                          setEditDialogOpenIndex={setEditDialogOpenIndex}
                          key={`${i}-${j}`}
                          urlPrms={urlPrms}
                          event={event}
                          onEventClick={onEventClick}
                          filter={filter}
                          setSheetEditDialogOpenIndex={
                            setSheetEditDialogOpenIndex
                          }
                          sheetEditDialogOpenIndex={sheetEditDialogOpenIndex}
                          i={i}
                          j={j}
                        />
                      ))
                    : page?.items?.map((meeting, j) => (
                        <div key={`${i}-${j}`} className="relative">
                          <MeetingCards
                            urlPrms={urlPrms}
                            onMeetingClick={onMeetingClick}
                            meeting={meeting}
                          />
                        </div>
                      ))
                )
              ) : (
                <p className="text-center text-primary-text">
                  No schedules found.
                </p>
              )}
            </div>
            <div ref={ref}>{hasNextPage && <Skeleton />}</div>
          </div>
        </div>
      </div>
      <div className="no-scrollbar hidden w-full overflow-y-scroll rounded-2xl outline outline-2 outline-[#e7dad3] xl:block">
        {urlPrms.get("event") && <ScheduleDetails />}

        {!urlPrms.get("event") && !urlPrms.get("meeting") && (
          <div className="flex h-full items-center justify-center">
            <p>No schedule selected.</p>
          </div>
        )}
        {urlPrms.get("meeting") && <MeetingDetails />}
      </div>
    </div>
  );
};

export default Schedule;
