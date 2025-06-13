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
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn, convertTimeStringToDate, formatEventDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  answerSinglePoll,
  fetchPollUserAnswers,
} from "@/services/pollServices";
import { Skeleton } from "../ui/skeleton";
import usePoll from "@/hooks/usePoll";
import { useUser } from "@/context/useUser";
import { toast } from "@/hooks/use-toast";

const PollListInformation = ({ poll, isMobile, isSheetOpen, setSheetOpen }) => {
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
                isExpired ? "mingcute:close-circle-fill" : "mingcute:time-line"
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
      <PollEntriesVote poll_id={poll.id} isExpired={isExpired} />
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

PollListInformation.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    expiration_date: PropTypes.string,
  }),
  isMobile: PropTypes.bool,
  isSheetOpen: PropTypes.bool,
  setSheetOpen: PropTypes.func,
};

const PollEntriesVote = ({ poll_id, isExpired }) => {
  const { PollDates } = usePoll({ poll_id });
  const { data: dates, isLoading, isError, error } = PollDates;

  return (
    <div className="mt-10 space-y-4">
      <Label className="text-xl font-semibold">Entries</Label>
      {isLoading ? (
        <Skeleton className="h-20" />
      ) : isError ? (
        <div className="text-red-500">
          Error fetching poll dates:{" "}
          {error?.message || "An unknown error occurred"}
        </div>
      ) : (
        dates?.map((date) => (
          <div
            key={date.id}
            className="rounded-xl border border-primary px-2 py-4 md:px-6 md:py-4"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center">
                <Label className="flex-1 text-sm font-semibold md:text-lg">
                  {formatEventDate(date.date)}
                </Label>
                <div className="flex flex-1 items-center gap-x-6 text-nowrap text-sm font-semibold text-accent md:gap-x-10">
                  <p>Available</p>
                  <p>If needed</p>
                  <p>Unavailable</p>
                </div>
              </div>
              {date.poll_times &&
                date.poll_times.length > 0 &&
                date.poll_times.map((time, timeIndex) => (
                  <PollTime
                    poll_date_id={date.id}
                    poll_time_id={time.id}
                    key={timeIndex}
                    time={time.time}
                    poll_id={poll_id}
                    isExpired={isExpired}
                  />
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
PollEntriesVote.propTypes = {
  poll_id: PropTypes.string.isRequired,
  isExpired: PropTypes.bool.isRequired,
};

const PollTime = ({ poll_id, poll_date_id, poll_time_id, time, isExpired }) => {
  const { userData } = useUser();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollTimeAnswer", poll_time_id, userData?.id],
    queryFn: () =>
      fetchPollUserAnswers({
        poll_time_id,
        user_id: userData?.id,
      }),
    enabled: !!userData?.id || !!poll_time_id,
    keepPreviousData: true,
  });

  const answerPollMutation = useMutation({
    mutationFn: async ({ answer, id }) =>
      await answerSinglePoll({
        id,
        poll_id,
        poll_date_id,
        poll_time_id,
        user_id: userData?.id,
        answer,
      }),
    onMutate: (newAnswer) => {
      // Optimistically update the cache
      // Cancel any ongoing queries for this poll time
      queryClient.cancelQueries({
        queryKey: ["pollTimeAnswer", poll_time_id, userData?.id],
      });
      // Get the snapshot of the previous data
      const previousData = queryClient.getQueryData([
        "pollTimeAnswer",
        poll_time_id,
        userData?.id,
      ]);
      // Optimistically update the data
      queryClient.setQueryData(
        ["pollTimeAnswer", poll_time_id, userData?.id],
        (oldData) => ({
          ...oldData,
          answer: newAnswer.answer,
        })
      );
      return { previousData, newAnswer };
    },
    onSuccess: () => {
      toast({
        title: "Poll answered successfully!",
        description: "Your answer has been recorded.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["pollTimeAnswer", poll_time_id, userData?.id],
      });
    },
    onError: (error, newAnswer, context) => {
      // If the mutation fails, roll back to the previous data

      toast({
        variant: "destructive",
        title: "Error answering poll",
        description: error.message || "An unknown error occurred.",
      });
      queryClient.setQueryData(
        ["pollTimeAnswer", poll_time_id, userData?.id],
        context.previousData
      );
    },
  });

  if (isLoading) {
    return <Skeleton className="h-20" />;
  }
  if (isError) {
    return (
      <div className="text-red-500">
        Error fetching poll time data:{" "}
        {error?.message || "An unknown error occurred"}
      </div>
    );
  }

  const handleAnswer = async (answer, id) => {
    answerPollMutation.mutate({ answer, id });
  };

  const statusOptions = [
    {
      key: "available",
      iconName: "mingcute:check-circle-line",
      iconColor: "#5BD071",
      activeColor: "bg-[#5BD071] hover:bg-[#5BD071]",
      inactiveColor:
        "bg-white hover:bg-[#5BD071] hover:text-white text-[#5BD071]",
    },
    {
      key: "ifneeded",
      iconName: "mingcute:minus-circle-line",
      iconColor: "#3AABB8",
      activeColor: "bg-[#3AABB8] hover:bg-[#3AABB8]",
      inactiveColor:
        "bg-white hover:bg-[#3AABB8] hover:text-white text-[#3AABB8]",
    },
    {
      key: "unavailable",
      iconName: "mingcute:close-circle-line",
      iconColor: "#E24841",
      activeColor: "bg-[#E24841] hover:bg-[#E24841] ",
      inactiveColor:
        "bg-white hover:bg-[#E24841] hover:text-white text-[#E24841]",
    },
  ];
  return (
    <div className="flex gap-x-2 rounded-xl bg-primary/50 px-4 py-2">
      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex-1">
            <Label className="text-sm font-semibold md:text-lg">
              {convertTimeStringToDate(time).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Label>
          </div>
          <div className="flex flex-1 items-center gap-x-4 md:gap-x-10">
            {statusOptions.map((option) => {
              const isActive = data?.answer === option.key;
              return (
                <Button
                  key={option.key}
                  variant="ghost"
                  size="sm"
                  disabled={isActive || isExpired}
                  className={cn(
                    "rounded-full p-6 text-xs font-medium shadow-[inset_0px_2px_6px_rgba(0,0,0,0.12)] transition-colors",
                    isActive ? option.activeColor : option.inactiveColor
                  )}
                  onClick={() => handleAnswer(option.key, data?.id)}
                >
                  <Icon
                    icon={option.iconName}
                    className={cn(
                      `text-[${option.iconColor}]`,
                      isActive
                        ? "text-white"
                        : `hover:text-[${option.iconColor}]`
                    )}
                    // color={isActive ? "#FFFFFF" : option.iconColor}
                    width={24}
                    height={24}
                  />
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

PollTime.propTypes = {
  poll_id: PropTypes.string.isRequired,
  poll_date_id: PropTypes.string.isRequired,
  poll_time_id: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  isExpired: PropTypes.bool.isRequired,
};
// const AvailabilityTimeSlot = ({
//   date = "18 February 2025",
//   time = "08:00 AM",
//   initialStatus = "available",
// }) => {

//   const getStatusText = () => {
//     switch (selectedStatus) {
//       case "available":
//         return "Available";
//       case "if-needed":
//         return "If Needed";
//       case "unavailable":
//         return "Unavailable";
//       default:
//         return "Available";
//     }
//   };

//   return (
//     <div className="flex gap-2">
//       {statusOptions.map((option) => {
//         const Icon = option.icon;
//         const isActive = selectedStatus === option.key;
//         return (
//           <Button
//             key={option.key}
//             variant="ghost"
//             size="sm"
//             className={cn(
//               "h-8 rounded-full px-3 text-xs font-medium transition-colors",
//               isActive ? option.activeColor : option.inactiveColor
//             )}
//             onClick={() => setSelectedStatus(option.key)}
//           >
//             <Icon className="mr-1 h-3 w-3" />
//             {option.label}
//           </Button>
//         );
//       })}
//     </div>
//   );
// };

export default PollListInformation;
