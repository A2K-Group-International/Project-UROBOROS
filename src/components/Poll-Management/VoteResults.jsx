import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
import { useQuery } from "@tanstack/react-query";
import { fetchPollAnswers } from "@/services/pollServices";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const VoteResults = ({ dates, pollName }) => {
  // State for selected date/time combination
  const [selectedDateOption, setSelectedDateOption] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const MOBILE_BREAKPOINT = 768;

  // Date options for select
  const dateOptions = useMemo(() => {
    return (
      dates?.flatMap(
        (date) =>
          date.poll_times?.map((time) => ({
            value: `${date.id}_${time.id}`,
            label: `${formatEventDate(date.date)}; ${formatEventTime(time.time)}`,
            dateId: date.id,
            timeId: time.id,
          })) || []
      ) || []
    );
  }, [dates]);

  // Set initial selection
  useEffect(() => {
    if (dateOptions.length > 0) {
      setSelectedDateOption(dateOptions[0].value);
    }
  }, [dates]);

  // Get currently selected date and time IDs
  const selectedIds = selectedDateOption.split("_");
  const poll_date_id = selectedIds[0];
  const poll_time_id = selectedIds[1];

  // Query using selected option
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pollTime", poll_date_id, poll_time_id],
    queryFn: () =>
      fetchPollAnswers({
        poll_date_id,
        poll_time_id,
      }),
    enabled: !!poll_date_id && !!poll_time_id,
  });

  // Handle selection change
  const handleDateSelect = (value) => {
    setSelectedDateOption(value);
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); // lg breakpoint in Tailwind is 1024px
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile); // Cleanup
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Icon icon="fluent:document-data-16-regular" width={24} height={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-7xl flex-col text-accent">
        <DialogHeader>
          <DialogTitle className="text-start">{pollName} Entries</DialogTitle>
          <DialogDescription className="sr-only">
            This modal displays the entries for the selected poll.
          </DialogDescription>
          <div>
            <SelectDate
              selectedDateOption={selectedDateOption}
              handleDateSelect={handleDateSelect}
              dateOptions={dateOptions}
            />
          </div>
          <div>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <span>Loading results...</span>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center p-8 text-red-500">
                <Icon icon="mingcute:warning-fill" className="mb-2 h-8 w-8" />
                <p className="text-center">
                  Error loading results: {error?.message || "Unknown error"}
                </p>
              </div>
            ) : // Only render content if we have data and no errors
            isMobile ? (
              <MobileViewContent data={data} />
            ) : (
              <TabViewContent data={data} />
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

VoteResults.propTypes = {
  dates: PropTypes.array,
  pollName: PropTypes.string.isRequired,
};

const SelectDate = ({ selectedDateOption, handleDateSelect, dateOptions }) => {
  return (
    <Select value={selectedDateOption} onValueChange={handleDateSelect}>
      <SelectTrigger className="max-w-[210px] bg-white">
        <SelectValue placeholder="Select date and time" />
      </SelectTrigger>
      <SelectContent>
        {dateOptions?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

SelectDate.propTypes = {
  selectedDateOption: PropTypes.string.isRequired,
  handleDateSelect: PropTypes.func.isRequired,
  dateOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      dateId: PropTypes.string.isRequired,
      timeId: PropTypes.string.isRequired,
    })
  ).isRequired,
};

const UserResponseList = ({ users, emptyMessage = "No response yet" }) => {
  return (
    <>
      {users?.length > 0 ? (
        users.map((item, index) => (
          <li key={index} className="rounded-md bg-white px-3 py-4">
            <p className="text-sm">
              {item.users.first_name} {item.users.last_name}
            </p>
          </li>
        ))
      ) : (
        <li className="text-gray-500 rounded-md bg-white px-3 py-4">
          {emptyMessage}
        </li>
      )}
    </>
  );
};

UserResponseList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      users: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
      }),
    })
  ),
  emptyMessage: PropTypes.string,
};

const MobileViewContent = ({ data }) => {
  const availableCount = data?.available?.length || 0;
  const ifNeededVoteCount = data?.ifneeded?.length || 0;
  const unavailableVoteCount = data?.unavailable?.length || 0;
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem className="space-y-2 rounded-lg bg-[rgba(91,208,113,0.06)] px-6 py-2">
          {/* Header */}
          <CarouselHeaderItem
            headerName="Available"
            headerIcon="mingcute:check-circle-fill"
            headerBgColor="#5BD071"
            voteCount={availableCount}
          />
          {/* List */}
          <ul className="no-scrollbar mt-2 flex max-h-[20rem] flex-col gap-y-2 overflow-y-scroll text-start">
            <UserResponseList users={data?.available} />
          </ul>
        </CarouselItem>
        <CarouselItem className="rounded-lg bg-[rgba(58,171,184,0.06)] px-6 py-2">
          {/* Header */}
          <CarouselHeaderItem
            headerName="If Needed"
            headerIcon="mingcute:minus-circle-fill"
            headerBgColor="#3AABB8"
            voteCount={ifNeededVoteCount}
          />
          {/* List */}
          <ul className="no-scrollbar mt-2 flex max-h-[20rem] flex-col gap-y-2 overflow-y-scroll text-start">
            <UserResponseList users={data?.ifneeded} />
          </ul>
        </CarouselItem>
        <CarouselItem
          className="rounded-lg px-6 py-2"
          style={{
            background:
              "linear-gradient(0deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.02) 100%), rgba(226, 72, 65, 0.06)",
          }}
        >
          {/* Header */}
          <CarouselHeaderItem
            headerName="Unavailable"
            headerIcon="mingcute:close-circle-fill"
            headerBgColor="#E24841"
            voteCount={unavailableVoteCount}
          />
          {/* List */}
          <ul className="no-scrollbar mt-2 flex max-h-[20rem] flex-col gap-y-2 overflow-y-scroll text-start">
            <UserResponseList users={data?.unavailable} />
          </ul>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

MobileViewContent.propTypes = {
  data: PropTypes.shape({
    available: PropTypes.array,
    ifneeded: PropTypes.array,
    unavailable: PropTypes.array,
    availableCount: PropTypes.number,
    ifneededCount: PropTypes.number,
    unavailableCount: PropTypes.number,
    availablePercent: PropTypes.number,
    ifneededPercent: PropTypes.number,
    unavailablePercent: PropTypes.number,
  }),
};

const CarouselHeaderItem = ({
  headerName,
  headerIcon,
  headerBgColor,
  voteCount,
}) => {
  return (
    <div className="flex items-center gap-x-3">
      <div
        className={`flex items-center gap-1 rounded-md py-1 pl-1 pr-2 text-white`}
        style={{ backgroundColor: headerBgColor }}
      >
        <Icon icon={headerIcon} width={20} height={20} />
        <p className="text-[12px] font-semibold">{headerName}</p>
      </div>
      <div>
        <p className="text-[12px] font-medium text-[#9B9B9B]">{voteCount}</p>
      </div>
    </div>
  );
};

CarouselHeaderItem.propTypes = {
  headerName: PropTypes.string.isRequired,
  headerIcon: PropTypes.string.isRequired,
  headerBgColor: PropTypes.string,
  voteCount: PropTypes.number.isRequired,
};

const TabViewContent = ({ data }) => {
  const availableCount = data?.available?.length || 0;
  const ifNeededVoteCount = data?.ifneeded?.length || 0;
  const unavailableVoteCount = data?.unavailable?.length || 0;
  return (
    <div className="mt-4 grid grid-cols-3 gap-x-2">
      <div className="rounded-lg bg-[rgba(91,208,113,0.06)] p-2">
        {/* Header */}
        <CarouselHeaderItem
          headerName="Available"
          headerIcon="mingcute:check-circle-fill"
          headerBgColor="#5BD071"
          voteCount={availableCount}
        />
        {/* List */}
        <ul className="no-scrollbar mt-2 flex max-h-[20rem] flex-col gap-y-2 overflow-y-scroll text-start">
          <UserResponseList users={data?.available} />
        </ul>
      </div>
      <div className="rounded-lg bg-[rgba(58,171,184,0.06)] p-2">
        {/* Header */}
        <CarouselHeaderItem
          headerName="If Needed"
          headerIcon="mingcute:minus-circle-fill"
          headerBgColor="#3AABB8"
          voteCount={ifNeededVoteCount}
        />
        {/* List */}
        <ul className="no-scrollbar mt-2 flex max-h-[20rem] flex-col gap-y-2 overflow-y-scroll text-start">
          <UserResponseList users={data?.ifneeded} />
        </ul>
      </div>
      <div
        style={{
          background:
            "linear-gradient(0deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.02) 100%), rgba(226, 72, 65, 0.06)",
        }}
        className="rounded-lg p-2"
      >
        {/* Header */}
        <CarouselHeaderItem
          headerName="Unavailable"
          headerIcon="mingcute:close-circle-fill"
          headerBgColor="#E24841"
          voteCount={unavailableVoteCount}
        />
        {/* List */}
        <ul className="no-scrollbar mt-2 flex max-h-[20rem] flex-col gap-y-2 overflow-y-scroll text-start">
          <UserResponseList users={data?.unavailable} />
        </ul>
      </div>
    </div>
  );
};

TabViewContent.propTypes = {
  data: PropTypes.shape({
    available: PropTypes.array,
    ifneeded: PropTypes.array,
    unavailable: PropTypes.array,
    availableCount: PropTypes.number,
    ifneededCount: PropTypes.number,
    unavailableCount: PropTypes.number,
    availablePercent: PropTypes.number,
    ifneededPercent: PropTypes.number,
    unavailablePercent: PropTypes.number,
  }),
};

export default VoteResults;
