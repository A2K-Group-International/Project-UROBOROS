import { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useUser } from "@/context/useUser";
import { Icon } from "@iconify/react";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import FamilyData from "./FamilyData";

const ManualAttendEvents = ({ eventId, eventName, eventTime, eventDate }) => {
  const [selectedEvent, setSelectedEvent] = useState(null); // set the selected event

  // Get the userId
  const { userData } = useUser();
  const userId = userData?.id;

  const handleSelectEvent = useCallback(() => {
    setSelectedEvent(eventId);
  }, [eventId]);

  // Add effect to track state changes
  useEffect(() => {}, [selectedEvent]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={handleSelectEvent} className="w-full">
          Manage Attendance
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar h-auto max-h-[37rem] overflow-scroll text-primary-text">
        <DialogHeader className="font-bold">
          <DialogTitle className="text-xl">{`${eventName}`}</DialogTitle>
          <div className="flex items-center justify-center gap-x-1 sm:justify-start">
            <Label className="font-semibold">
              {formatEventDate(eventDate)}
            </Label>
            <Label>{formatEventTime(eventTime)}</Label>
          </div>
          <DialogDescription className="font-medium">
            <div className="flex items-center justify-center gap-x-1 text-primary-text sm:justify-start">
              <Icon icon="mingcute:information-line" width="20" height="20" />
              Choose who you would like to attend with.
            </div>
          </DialogDescription>
        </DialogHeader>
        <div>
          <FamilyData userId={userId} selectedEvent={selectedEvent} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <div className="flex justify-center">
              <Button className="rounded-3xl px-8">Close</Button>
            </div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

ManualAttendEvents.propTypes = {
  eventId: PropTypes.string,
  eventName: PropTypes.string,
  eventTime: PropTypes.string,
  eventDate: PropTypes.string,
};

export default ManualAttendEvents;
