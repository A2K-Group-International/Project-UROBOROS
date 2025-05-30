import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";

const SaveEventButton = ({ eventName, eventDate, eventTime }) => {
  // Check if the device is mobile to adjust calendar URL generation
  const isMobileDevice = () => {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  };

  const isIOS = () => {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  // Add this function to detect Android specifically
  const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
  };

  // Add a helper function to generate ICS content
  const generateIcsContent = (startDate, endDate) => {
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//St Laurence//Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${eventName}
DTSTART:${startDate.toISOString().replace(/-|:|\.\d+/g, "")}
DTEND:${endDate.toISOString().replace(/-|:|\.\d+/g, "")}
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, "")}
UID:${Math.random().toString(36).substring(2)}@portal.saintlaurence.org.uk
STATUS:CONFIRMED
X-MICROSOFT-CDO-ALLDAYEVENT:${!eventTime ? "TRUE" : "FALSE"}
X-MICROSOFT-CDO-BUSYSTATUS:BUSY
END:VEVENT
END:VCALENDAR`;
  };

  const formatCalendarDate = (dateStr, timeStr) => {
    try {
      const date = new Date(dateStr);

      // If time is provided, append it to the date
      if (timeStr) {
        //Handle format like "9:30:00"
        const timeParts = timeStr.split(":");
        date.setHours(
          parseInt(timeParts[0], 10),
          parseInt(timeParts[1], 10),
          parseInt(timeParts[2] || 0, 10)
        );
      } else {
        // If no time is provided, set to start of the day
        date.setHours(0, 0, 0, 0);
      }

      // Format to YYYYMMDDTHHMMSSZ
      return date.toISOString().replace(/-|:|\.\d+/g, "");
    } catch (error) {
      console.error("Error formatting date:", error);
    }
  };

  const getGoogleCalendarUrl = () => {
    try {
      let startDate, endDate;

      if (eventTime) {
        // For timed events - include time zone
        const startDateTime = new Date(eventDate);
        const timeParts = eventTime.split(":");

        startDateTime.setHours(
          parseInt(timeParts[0], 10),
          parseInt(timeParts[1], 10),
          parseInt(timeParts[2] || 0, 10)
        );

        // Create end time (1h30m later)
        const endDateTime = new Date(startDateTime.getTime());
        const oneHourThirtyMins = (1 * 60 + 30) * 60 * 1000;
        endDateTime.setTime(endDateTime.getTime() + oneHourThirtyMins);

        // Format with time zone info for Google Calendar
        startDate = startDateTime
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d+/g, "");
        endDate = endDateTime
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d+/g, "");
      } else {
        // For all-day events - use date-only format without time (YYYYMMDD)
        const startDay = new Date(eventDate);
        startDay.setHours(0, 0, 0, 0);

        const endDay = new Date(eventDate);
        endDay.setDate(endDay.getDate() + 1); // End date is exclusive in Google Calendar
        endDay.setHours(0, 0, 0, 0);

        // Format as YYYYMMDD (no time component for all-day events)
        startDate = startDay.toISOString().slice(0, 10).replace(/-/g, "");
        endDate = endDay.toISOString().slice(0, 10).replace(/-/g, "");
      }

      // Add time zone parameter for accurate time display
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventName)}&dates=${startDate}/${endDate}&ctz=${encodeURIComponent(userTimeZone)}`;
    } catch (error) {
      console.error("Error generating Google Calendar URL:", error);
      return "#"; // Fallback URL
    }
  };

  const getOutlookCalendarUrl = () => {
    try {
      // For Outlook, we'll use ISO format dates
      const startDate = new Date(eventDate);
      let endDate;

      if (eventTime) {
        // Add the time component
        const timeParts = eventTime.split(":");
        startDate.setHours(
          parseInt(timeParts[0], 10),
          parseInt(timeParts[1], 10),
          parseInt(timeParts[2] || 0, 10)
        );

        // Create end time (1h30m later)
        endDate = new Date(startDate.getTime());
        const oneHourThirtyMins = (1 * 60 + 30) * 60 * 1000;
        endDate.setTime(endDate.getTime() + oneHourThirtyMins);
      } else {
        // For all-day events
        endDate = new Date(eventDate);

        if (isMobileDevice()) {
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 0);
        }
      }

      // Format dates for Outlook (ISO format)
      const startIso = startDate.toISOString();
      const endIso = endDate.toISOString();

      if (isMobileDevice()) {
        // Check if it's iOS or Android
        if (isIOS()) {
          const formattedStartDate = startIso.split(".")[0]; // Remove milliseconds and timezone
          const formattedEndDate = endIso.split(".")[0]; // Remove milliseconds and timezone

          // Create a new event for outlook on iOS
          // Format: ms-outlook://events/new?title=&start=&end=&location=&attendees=
          return `ms-outlook://events/new?title=${encodeURIComponent(eventName)}&start=${encodeURIComponent(formattedStartDate)}&end=${encodeURIComponent(formattedEndDate)}`;
        }
        // For Android, use the ICS file
        else if (isAndroid()) {
          const formattedStartDate = startIso.split(".")[0]; // Remove milliseconds and timezone
          const formattedEndDate = endIso.split(".")[0]; // Remove milliseconds and timezone

          // Create a new event for outlook on Android
          return `ms-outlook://events/new?title=${encodeURIComponent(eventName)}&start=${encodeURIComponent(formattedStartDate)}&end=${encodeURIComponent(formattedEndDate)}`;
        } else {
          return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventName)}&startdt=${startIso}&enddt=${endIso}${!eventTime ? "&allday=true" : ""}`;
        }
      } else {
        // For desktop, use the web URL
        return `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventName)}&startdt=${startIso}&enddt=${endIso}${!eventTime ? "&allday=true" : ""}`;
      }
    } catch (error) {
      console.error("Error generating Outlook Calendar URL:", error);
      return "#"; // Fallback URL
    }
  };

  const getAppleCalendarUrl = () => {
    try {
      // Format dates for ICS
      const startDate = formatCalendarDate(eventDate, eventTime);
      let endDate;

      if (eventTime) {
        // Create end time 1h30m later
        const endDateTime = new Date(eventDate);
        const timeParts = eventTime.split(":");

        endDateTime.setHours(
          parseInt(timeParts[0], 10),
          parseInt(timeParts[1], 10),
          parseInt(timeParts[2] || 0, 10)
        );

        // Add 1h30m
        const oneHourThirtyMins = (1 * 60 + 30) * 60 * 1000;
        endDateTime.setTime(endDateTime.getTime() + oneHourThirtyMins);

        endDate = endDateTime.toISOString().replace(/-|:|\.\d+/g, "");
      } else {
        // For all-day event
        const nextDay = new Date(eventDate);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        endDate = nextDay.toISOString().replace(/-|:|\.\d+/g, "");
      }

      // Create ICS content
      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:${eventName}
DTSTART:${startDate}
DTEND:${endDate}
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, "")}
UID:${Math.random().toString(36).substring(2)}@portal.saintlaurence.org.uk
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

      // Create data URI for download
      return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    } catch (error) {
      console.error("Error generating Apple Calendar URL:", error);
      return "#"; // Fallback URL
    }
  };

  return (
    <Popover>
      <PopoverTrigger onClick={(e) => e.stopPropagation()} asChild>
        <Button variant="outline" className="font-bold hover:text-primary-text">
          Add to Calendar
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="max-w-64 overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 hover:bg-[#f5f5f5]"
          >
            <Icon icon="flat-color-icons:google" width={24} height={24} />
            <span>Google</span>
          </a>
        </div>
        {isIOS() && isMobileDevice() && (
          <div>
            <a
              href={getAppleCalendarUrl()}
              className="flex items-center gap-2 px-6 py-2 hover:bg-[#f5f5f5]"
            >
              <Icon icon="bi:apple" width={24} height={24} />
              <span>Apple</span>
            </a>
          </div>
        )}
        <div>
          {isMobileDevice() ? (
            <a
              href={getOutlookCalendarUrl()}
              className="flex items-center gap-2 px-6 py-2 hover:bg-[#f5f5f5]"
              onClick={(e) => {
                e.stopPropagation();
                // If we detect iOS but Outlook might not be installed, offer a fallback
                if (isIOS() || isAndroid()) {
                  setTimeout(() => {
                    // Check if the page is still active (meaning the app didn't open)
                    const downloadLink = document.createElement("a");
                    downloadLink.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(generateIcsContent(new Date(eventDate), new Date(eventDate)))}`;
                    downloadLink.download = `${eventName.replace(/\s+/g, "-")}.ics`;
                    downloadLink.style.display = "none";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                  }, 2000);
                }
              }}
            >
              <Icon
                icon="ph:microsoft-outlook-logo-fill"
                color="#0072c6"
                width={24}
                height={24}
              />
              <span>Outlook</span>
            </a>
          ) : (
            <a
              href={getOutlookCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-2 hover:bg-[#f5f5f5]"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon
                icon="ph:microsoft-outlook-logo-fill"
                color="#0072c6"
                width={24}
                height={24}
              />
              <span>Outlook</span>
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

SaveEventButton.propTypes = {
  eventName: PropTypes.string.isRequired,
  eventDate: PropTypes.string.isRequired,
  eventTime: PropTypes.string,
};

export default SaveEventButton;
