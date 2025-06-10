import { useEffect, useState } from "react";
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
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
// import { useQuery } from "@tanstack/react-query";
// import { fetchPollUserAnswers } from "@/services/pollServices";
import { formatEventDate, formatEventTime } from "@/lib/utils";

const VoteResults = ({ dates, pollName }) => {
  // State for selected date/time combination
  const [selectedDateOption, setSelectedDateOption] = useState("");

  // Date options for select
  const dateOptions =
    dates?.flatMap(
      (date) =>
        date.poll_times?.map((time) => ({
          value: `${date.id}_${time.id}`,
          label: `${formatEventDate(date.date)}; ${formatEventTime(time.time)}`,
          dateId: date.id,
          timeId: time.id,
        })) || []
    ) || [];

  // Set initial selection
  useEffect(() => {
    if (dateOptions.length > 0) {
      setSelectedDateOption(dateOptions[0].value);
    }
  }, [dates]);

  // Get currently selected date and time IDs
  //   const selectedIds = selectedDateOption.split("_");
  //   const poll_date_id = selectedIds[0];
  //   const poll_time_id = selectedIds[1];

  // Query using selected option
  //   const { data, isLoading, isError, error } = useQuery({
  //     queryKey: ["pollTime", poll_date_id, poll_time_id],
  //     queryFn: () =>
  //       fetchPollUserAnswers({
  //         poll_date_id,
  //         poll_time_id,
  //       }),
  //     enabled: !!poll_date_id && !!poll_time_id,
  //   });

  // Handle selection change
  const handleDateSelect = (value) => {
    setSelectedDateOption(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <Icon icon="fluent:document-data-16-regular" width={24} height={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl text-accent">
        <DialogHeader>
          <DialogTitle>{pollName} Entries</DialogTitle>
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
      <SelectTrigger className="bg-white">
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

export default VoteResults;
