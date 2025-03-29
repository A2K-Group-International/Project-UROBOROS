import { useState } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Description } from "../Title";
import ManualAttendEvents from "./ManualAttendEvents";
import SampleImage from "@/assets/images/CartoonizedChurch.png";
import { Button } from "../ui/button";
import { Icon } from "@iconify/react";
import { formatEventDate, formatEventTime } from "@/lib/utils";

const EventCard = ({
  eventId,
  eventName,
  eventDate,
  eventTime,
  eventImage,
  requireAttendance,
}) => {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <>
      <Card className="h-[27rem] max-h-[27rem] w-72 rounded-2xl border-primary-text/30 text-primary-text">
        <CardContent className="flex h-full flex-col gap-y-1 p-4">
          {/* Image container with fixed size and aspect ratio */}
          <div className="aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border border-primary-text/30">
            <img
              src={eventImage ?? SampleImage}
              alt="Event Image"
              className="h-full w-full object-cover"
              onClick={() => setShowFullImage(true)}
            />
          </div>
          <CardTitle className="mt-4 break-words px-2 text-[16px] font-bold">
            {eventName}
          </CardTitle>
          <Description className="flex-grow break-words px-2 text-[14px] font-medium">
            {requireAttendance
              ? `${formatEventDate(eventDate)} ${formatEventTime(eventTime)}`
              : formatEventDate(eventDate)}
          </Description>
          {requireAttendance && (
            <ManualAttendEvents
              eventId={eventId}
              eventName={eventName}
              eventTime={eventTime}
              eventDate={eventDate}
            />
          )}
        </CardContent>
      </Card>
      {/* Full screen image modal */}
      {showFullImage && (
        <div
          className="w-dvh fixed inset-0 z-50 flex h-dvh items-center justify-center bg-black/80 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={eventImage ?? SampleImage}
              alt="Event Image"
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            <Button
              className="text-primary-foreground absolute -right-4 -top-4 w-10 rounded-full p-2"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullImage(false);
              }}
            >
              <Icon icon="mingcute:close-fill" width={24} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

// Add PropTypes validation
EventCard.propTypes = {
  eventId: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  eventDescription: PropTypes.string,
  eventDate: PropTypes.string.isRequired,
  eventTime: PropTypes.string.isRequired,
  eventImage: PropTypes.string,
  requireAttendance: PropTypes.bool,
};

export default EventCard;
