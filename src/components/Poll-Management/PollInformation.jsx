import PropTypes from "prop-types";
import { Description, Title } from "../Title";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format, isPast, parseISO } from "date-fns";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useState } from "react";
import TimePickerv2 from "../TimePickerv2/TimePickerv2";
import Addpoll from "./Addpoll";

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
import { fetchPollUserAnswers } from "@/services/pollServices";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { convertTimeStringToDate } from "@/lib/utils";
import usePoll from "@/hooks/usePoll";
import { useUser } from "@/context/useUser";

const PollInformation = ({ poll, isMobile, isSheetOpen, setSheetOpen }) => {
  // Parse the ISO date string to a Date object
  const expiryDate = poll?.expiration_date
    ? parseISO(poll?.expiration_date)
    : null;

  // Format date to day name (Monday, Tuesday, etc.)
  const dayName = expiryDate ? format(expiryDate, "EEEE") : null;

  // Get time from the ISO date string directly
  const formattedTime = expiryDate ? format(expiryDate, "h:mm a") : null;

  // Check if poll is expired
  const isPollExpired = () => {
    if (!expiryDate) return false;
    return isPast(expiryDate);
  };

  const isExpired = isPollExpired();

  const pollContent = poll ? (
    <>
      <div className="flex justify-between">
        <div className="space-y-2">
          <Title className={`${isMobile ? "text-xl" : "text-2xl"}`}>
            {poll.name}
          </Title>
          <Description className="p-0">
            <span
              className={`flex rounded-xl p-2 font-semibold md:px-4 md:py-2 ${isExpired ? "max-w-28 bg-danger text-white" : "max-w-72 bg-primary"}`}
            >
              <Icon
                icon={
                  isExpired
                    ? "mingcute:close-circle-fill"
                    : "mingcute:time-line"
                }
                color="text-white"
                className="mr-1"
                width={14}
              />
              {isExpired ? "Closed" : `Open until ${dayName}, ${formattedTime}`}
            </span>
          </Description>
          <Description>{poll.description}</Description>
        </div>
        <div className="flex gap-x-2">
          {/* Edit Poll */}
          <Addpoll isEditing={true} poll={poll} />
          {/* Delete poll */}
          <DeletePoll poll_id={poll.id} />
        </div>
      </div>
      <PollEntries poll_id={poll.id} />
    </>
  ) : (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <Icon
        icon="mingcute:file-search-line"
        className="mb-3 text-accent/50"
        width={isMobile ? 48 : 64}
        height={isMobile ? 48 : 64}
      />
      <Title className="text-center text-lg">No Poll Selected</Title>
      <Description className="text-center text-sm">
        Select a poll from the list to view details
      </Description>
    </div>
  );

  // For mobile: Display content inside a sheet
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="no-scrollbar w-full overflow-y-scroll border-none px-2 py-6"
          side="right"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="sr-only flex items-center justify-between">
              Poll Details
            </SheetTitle>
            <SheetDescription className="sr-only">
              This is the poll information. You can view and manage the details
              here.
            </SheetDescription>
          </SheetHeader>
          <div className="px-1">{pollContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop: Display content directly
  return <>{pollContent}</>;
};

PollInformation.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    expiration_date: PropTypes.string,

    responses: PropTypes.number,
  }),
  isMobile: PropTypes.bool,
  isSheetOpen: PropTypes.bool,
  setSheetOpen: PropTypes.func,
};

const PollEntries = ({ poll_id }) => {
  const [activeTimePickerIndex, setActiveTimePickerIndex] = useState(null);
  const { addTimeSlotMutation, PollDates } = usePoll({ poll_id });
  const { data: dates, isLoading, isError, error } = PollDates;

  const onSubmit = (poll_date_id, time) => {
    addTimeSlotMutation.mutate({
      poll_date_id,
      time,
    });
  };

  return (
    <div className="mt-10 space-y-4">
      <Label className="text-xl font-semibold">Entries</Label>
      {isLoading ? (
        <Skeleton className="h-10 w-full rounded-xl bg-primary/20" />
      ) : isError ? (
        <div className="text-red-500">
          Error fetching poll dates:{" "}
          {error?.message || "An unknown error occurred"}
        </div>
      ) : (
        <>
          {dates && dates.length > 0 ? (
            dates.map((date, index) => (
              <div
                key={index}
                className="rounded-xl border border-primary px-2 py-4 md:px-6 md:py-4"
              >
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">
                    {new Date(date.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Label>
                  {date.poll_times &&
                    date.poll_times.length > 0 &&
                    date.poll_times.map((time, timeIndex) => (
                      <PollTime
                        poll_date_id={date.id}
                        poll_time_id={time.id}
                        key={timeIndex}
                        time={time.time}
                      />
                    ))}

                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTimePickerIndex(true)}
                      className="w-full rounded-xl border-none bg-primary font-semibold text-primary-text hover:bg-primary hover:font-semibold hover:text-primary-text"
                    >
                      {addTimeSlotMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <Icon
                            icon="mingcute:loading-2-fill"
                            className="animate-spin"
                            width={20}
                            height={20}
                          />
                          <span className="ml-2">Adding...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <Icon
                            icon="mingcute:add-line"
                            width={20}
                            height={20}
                          />
                          <span className="ml-2">Add Time Slot </span>
                        </span>
                      )}
                    </Button>
                    {/* Render TimePicker when this is the active date */}
                    {activeTimePickerIndex && (
                      <TimePickerv2
                        setTime={(time) => onSubmit(date.id, time)}
                        setActivity={(isActive) => {
                          if (!isActive) {
                            setActiveTimePickerIndex(null);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>No dates available</div>
          )}
        </>
      )}
    </div>
  );
};

PollEntries.propTypes = {
  poll_id: PropTypes.string.isRequired,
};

const DeletePoll = ({ poll_id }) => {
  const { userData } = useUser();
  const { DeletePollMutation } = usePoll({ user_id: userData?.id });
  const { mutate, isPending } = DeletePollMutation;
  const handleDelete = (poll_id) => {
    mutate(poll_id);
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" className="rounded-xl">
          <Icon icon="mingcute:delete-2-fill" width={20} height={20} />
          Delete poll
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the poll
            and remove all its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(poll_id)}
            type="button"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <Icon
                  icon="mingcute:loading-2-fill"
                  className="animate-spin"
                  width={20}
                  height={20}
                />
                <span className="ml-2">Deleting...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Icon icon="mingcute:delete-2-fill" width={20} height={20} />
                <span className="ml-2">Delete Poll</span>
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

DeletePoll.propTypes = {
  poll_id: PropTypes.string.isRequired,
};

const PollTime = ({ poll_date_id, poll_time_id, time }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollTime", poll_date_id, poll_time_id],
    queryFn: () =>
      fetchPollUserAnswers({
        poll_date_id,
        poll_time_id,
      }),
    enabled: !!poll_date_id && !!poll_time_id,
  });

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-xl bg-primary/20" />;
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center rounded-xl bg-primary/20">
        <span className="text-accent/70">No responses yet</span>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-red-500">
        Error fetching poll time data:{" "}
        {error?.message || "An unknown error occurred"}
      </div>
    );
  }
  return (
    <div
      key={poll_time_id}
      className="flex gap-x-2 rounded-xl bg-primary/50 px-4 py-2"
    >
      <div className="flex-1">
        <div className="flex justify-between">
          <div className="flex-1">
            <Label className="text-[14px] font-semibold">
              {convertTimeStringToDate(time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Label>
          </div>
          <div className="flex flex-1 items-center justify-end gap-x-10">
            <div className="flex items-center gap-x-2">
              <Icon
                icon="mingcute:check-circle-fill"
                color="#5BD071"
                width={20}
                height={20}
              />
              <span>{data.availableCount}</span>
            </div>
            <div className="flex items-center gap-x-2">
              <Icon
                icon="mingcute:minus-circle-fill"
                width={20}
                height={20}
                color="#3AABB8"
              />
              <span>{data.ifneededCount}</span>
            </div>
            <div className="flex items-center gap-x-2">
              <Icon
                icon="mingcute:close-circle-fill"
                width={20}
                height={20}
                color="#E24841"
              />
              <span>{data.unavailableCount}</span>
            </div>
          </div>
        </div>
        {/* GRAPH */}
        <div>
          <ResponseBar
            availablePercent={data.availablePercent}
            unavailablePercent={data.unavailablePercent}
            ifneededPercent={data.ifneededPercent}
          />
        </div>
      </div>
    </div>
  );
};

PollTime.propTypes = {
  poll_date_id: PropTypes.string.isRequired,
  poll_time_id: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};

const ResponseBar = ({
  availablePercent,
  unavailablePercent,
  ifneededPercent,
}) => {
  return (
    <div className="mt-3 flex h-2 w-full overflow-hidden rounded bg-white">
      <div
        className="bg-[#5BD071]"
        style={{ width: `${availablePercent}%` }}
      ></div>
      <div
        className="bg-[#3AABB8]"
        style={{ width: `${ifneededPercent}%` }}
      ></div>
      <div
        className="bg-[#E24841]"
        style={{ width: `${unavailablePercent}%` }}
      ></div>
    </div>
  );
};

ResponseBar.propTypes = {
  availablePercent: PropTypes.number.isRequired,
  unavailablePercent: PropTypes.number.isRequired,
  ifneededPercent: PropTypes.number.isRequired,
};

export default PollInformation;
