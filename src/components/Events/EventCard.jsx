import PropTypes from "prop-types";
import { useEffect, useState } from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Description } from "../Title";
import ManualAttendEvents from "./ManualAttendEvents";
import SampleImage from "@/assets/images/CartoonizedChurch.png";
import { useSearchParams } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { formatEventDate, formatEventTime } from "@/lib/utils";
import { Label } from "../ui/label";
import SaveEventButton from "./SaveEventButton";

const EventCard = ({
  eventId,
  eventName,
  eventDate,
  eventTime,
  eventImage,
  requireAttendance,
}) => {
  const [toggleCard, setToggleCard] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedEvent = searchParams.get("id");

  const handleToggleEventCard = () => {
    setToggleCard(true);
    setSearchParams({ id: eventId });
  };

  useEffect(() => {
    if (selectedEvent === eventId) {
      setToggleCard(true);
    }
  }, [selectedEvent, eventId]);

  return (
    <>
      <Card className="sm:h-[27rem] max-h-[27rem] w-full max-w-[90vw] sm:w-72 rounded-2xl border-primary-text/20 text-primary-text">
        <CardContent
          className="flex h-full cursor-pointer sm:flex-col sm:gap-y-1 p-4 gap-x-3"
          onClick={handleToggleEventCard}
        >
          {/* Image container with fixed size and aspect ratio */}
          <div className="min-w-[6rem] h-[6rem] sm:h-[unset] aspect-square sm:w-full overflow-hidden rounded-2xl border border-primary-text/30">
            <img
              src={eventImage || SampleImage}
              alt="Event Image"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-y-1 flex-grow items-start">
            <CardTitle className="sm:mt-4 break-words px-2 text-[16px] font-bold truncate max-w-[calc(90vw-9rem)]">
              {eventName}
            </CardTitle>
            <Description className="flex-grow break-words px-2 text-[14px] font-medium">
              {requireAttendance
                ? `${formatEventDate(eventDate)} ${formatEventTime(eventTime)}`
                : formatEventDate(eventDate)}
            </Description>
            <div className="flex w-full sm:flex-col sm:items-stretch flex-grow items-end justify-items-stretch gap-2 sm:gap-1">
              <div>
                {requireAttendance && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <ManualAttendEvents
                      eventId={eventId}
                      eventName={eventName}
                      eventTime={eventTime}
                      eventDate={eventDate}
                      elWidth={''}
                    />
                  </div>
                )}
              </div>
              <SaveEventButton
                eventName={eventName}
                eventDate={eventDate}
                eventTime={eventTime}
              />
            </div>
            </div>
            
          
        </CardContent>
      </Card>
      {/* Full screen event carad */}
      <AlertDialog
        open={toggleCard}
        onOpenChange={(isOpen) => {
          setToggleCard(isOpen);
          if (!isOpen) {
            searchParams.delete("id");
            setSearchParams(searchParams);
          }
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader className="p-6">
            <AlertDialogTitle className="sr-only">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
            <div className="aspect-square w-full overflow-hidden rounded-lg border border-primary-text/30">
              <img
                src={eventImage || SampleImage}
                alt="Event Image"
                className="h-full w-full object-cover"
              />
            </div>
          </AlertDialogHeader>
          <div className="border-t border-accent/30 p-6 text-primary-text">
            <Label className="text-xl font-bold">{eventName}</Label>
            <p className="text-sm font-medium">
              {requireAttendance
                ? `${formatEventDate(eventDate)} ${formatEventTime(eventTime)}`
                : formatEventDate(eventDate)}
            </p>
          </div>
          <AlertDialogFooter className="p-6">
            <AlertDialogCancel>Close</AlertDialogCancel>
            {requireAttendance && (
              <div onClick={(e) => e.stopPropagation()}>
                <ManualAttendEvents
                  eventId={eventId}
                  eventName={eventName}
                  eventTime={eventTime}
                  eventDate={eventDate}
                  elWidth={'full'}
                />
              </div>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Add PropTypes validation
EventCard.propTypes = {
  eventId: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
  eventDescription: PropTypes.string,
  eventDate: PropTypes.string.isRequired,
  eventTime: PropTypes.string,
  eventImage: PropTypes.string,
  requireAttendance: PropTypes.bool,
};

export default EventCard;
