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
          <DeletePoll />
        </div>
      </div>
      <PollEntries />
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

const PollEntries = () => {
  const [activeTimePickerIndex, setActiveTimePickerIndex] = useState(null);

  const addTimeSlot = (date, time) => {
    // Update state
    // Should get the date(id) in database undefined first
    console.log(`date and time: ${date}, ${time}`);
  };

  return (
    <div className="mt-10 space-y-4">
      <Label className="text-xl font-semibold">Entries</Label>
      <div className="rounded-xl border border-primary px-2 py-4 md:px-6 md:py-4">
        <div className="space-y-4">
          <Label className="text-lg font-semibold">18 February 2025</Label>
          <div className="flex gap-x-2 rounded-xl bg-primary/50 px-4 py-2">
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="flex-1">
                  <Label className="text-[14px] font-semibold">08:00 AM</Label>
                </div>
                <div className="flex flex-1 items-center justify-end gap-x-10">
                  <div className="flex items-center gap-x-2">
                    <Icon
                      icon="mingcute:check-circle-fill"
                      color="#5BD071"
                      width={20}
                      height={20}
                    />
                    <span>12</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Icon
                      icon="mingcute:minus-circle-fill"
                      width={20}
                      height={20}
                      color="#3AABB8"
                    />
                    <span>8</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Icon
                      icon="mingcute:close-circle-fill"
                      width={20}
                      height={20}
                      color="#E24841"
                    />
                    <span>5</span>
                  </div>
                </div>
              </div>
              {/* GRAPH */}
              <div>
                <ResponseBar />
              </div>
            </div>
          </div>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveTimePickerIndex(true)}
              className="w-full rounded-xl border-none bg-primary font-semibold text-primary-text hover:bg-primary hover:font-semibold hover:text-primary-text"
            >
              Add Time Slot
            </Button>
            {/* Render TimePicker when this is the active date */}
            {activeTimePickerIndex && (
              <TimePickerv2
                setTime={(date, time) => addTimeSlot(date, time)}
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
    </div>
  );
};

const DeletePoll = () => {
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
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ResponseBar = () => {
  return (
    <div className="mt-3 flex h-2 w-full overflow-hidden rounded bg-white">
      <div className="bg-[#5BD071]" style={{ width: "50%" }}></div>
      <div className="bg-[#3AABB8]" style={{ width: "30%" }}></div>
      <div className="bg-[#E24841]" style={{ width: "20%" }}></div>
    </div>
  );
};

export default PollInformation;
