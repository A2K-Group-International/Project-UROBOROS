import { fetchPollAvailabilitySummary } from "@/services/pollServices";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

const PollFooter = ({ pollId }) => {
  // Query using selected option
  const { data, isLoading, isError } = useQuery({
    queryKey: ["pollAvailability", pollId],
    queryFn: () => fetchPollAvailabilitySummary(pollId),
    enabled: !!pollId,
  });

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm font-semibold text-accent">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Finding best time...</span>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="text-sm font-semibold text-red-500">
        Could not determine availability
      </div>
    );
  }

  // Handle no data state
  if (
    !data?.bestDate ||
    data?.bestDate.availabilityScore === 0 ||
    data.bestDate.availabilityScore === 0
  ) {
    return (
      <div className="text-sm font-semibold text-accent">
        No availability data yet
      </div>
    );
  }

  let formattedDateTime = "";

  try {
    if (data.bestDate.rawDate) {
      // Format the date part: 18 February 2025
      const dateStr = format(new Date(data.bestDate.rawDate), "d MMMM yyyy");

      // Format the time part if available: convert "09:30:00" to "9:30 AM"
      let timeStr = "";

      if (data.bestTime?.time) {
        // Try to parse the time string
        const timeMatch = data.bestTime.time.match(
          /(\d{1,2}):(\d{2})(?::(\d{2}))?/
        );

        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = timeMatch[2];
          const ampm = hours >= 12 ? "PM" : "AM";

          // Convert to 12-hour format
          hours = hours % 12;
          hours = hours || 12; // Convert 0 to 12

          // Format as "9:30 AM"
          timeStr = `${hours}:${minutes} ${ampm}`;
        } else {
          // If unable to parse, use as is
          timeStr = data.bestTime.time;
        }
      }

      // Combine them with the semicolon separator
      formattedDateTime = dateStr + (timeStr ? `; ${timeStr}` : "");
    } else {
      // Fallback if no rawDate is available
      // Also format time if available
      let displayTime = data.bestTime?.time || "";

      if (displayTime) {
        const timeMatch = displayTime.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1], 10);
          const minutes = timeMatch[2];
          const ampm = hours >= 12 ? "PM" : "AM";
          hours = hours % 12;
          hours = hours || 12;
          displayTime = `${hours}:${minutes} ${ampm}`;
        }
      }

      formattedDateTime = `${data.bestDate.date}${displayTime ? `; ${displayTime}` : ""}`;
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    // Fallback to basic format
    formattedDateTime = `${data.bestDate.date}${data.bestTime?.time ? `; ${data.bestTime.time}` : ""}`;
  }

  return (
    <div className="text-sm font-semibold text-accent">
      <p>
        Most Available: <span className="font-normal">{formattedDateTime}</span>
      </p>
    </div>
  );
};

PollFooter.propTypes = {
  pollId: PropTypes.string,
};

export default PollFooter;
