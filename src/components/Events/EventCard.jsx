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
      <Card className="h-[27rem] max-h-[27rem] w-72 rounded-2xl border-primary-text/30 text-primary-text">
        <CardContent
          className="flex h-full cursor-pointer flex-col gap-y-1 p-4"
          onClick={handleToggleEventCard}
        >
          {/* Image container with fixed size and aspect ratio */}
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-primary-text/30">
            <img
              src={eventImage || SampleImage}
              alt="Event Image"
              className="h-full w-full object-cover"
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
            <div onClick={(e) => e.stopPropagation()}>
              <ManualAttendEvents
                eventId={eventId}
                eventName={eventName}
                eventTime={eventTime}
                eventDate={eventDate}
              />
            </div>
          )}
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {requireAttendance && (
              <div onClick={(e) => e.stopPropagation()}>
                <ManualAttendEvents
                  eventId={eventId}
                  eventName={eventName}
                  eventTime={eventTime}
                  eventDate={eventDate}
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
