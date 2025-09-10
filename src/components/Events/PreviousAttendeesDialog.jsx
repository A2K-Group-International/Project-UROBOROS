import PropTypes from "prop-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";

const PreviousAttendeesDialog = ({
  eventName,
  attendees,
  registeredAttendees,
  onQuickAttend,
  isSubmitting,
}) => {
  const parents = attendees?.filter((a) => a.attendee_type === "parents") || [];
  const children =
    attendees?.filter((a) => a.attendee_type === "children") || [];

  // ✅ Only those not already registered
  const notRegistered =
    attendees?.filter(
      (a) => !registeredAttendees?.some((r) => r.attendee_id === a.attendee_id)
    ) || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-2 bg-[#EFDED6] text-primary-text">
          View Previous Attendees of {eventName}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[30rem] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Previous Attendees
          </DialogTitle>
          <DialogDescription>
            These are the attendees from the last 3 {eventName} events.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Parents */}
          {parents.length > 0 && (
            <div className="rounded-xl border border-primary bg-[#F6F0ED] px-3 py-2">
              <Label className="mb-2 block font-semibold">
                Parents / Guardians
              </Label>
              {parents.map((attendee) => {
                const isRegistered = registeredAttendees?.some(
                  (r) => r.attendee_id === attendee.attendee_id
                );
                return (
                  <div
                    key={attendee.attendee_id}
                    className={`mb-2 flex items-center justify-between rounded-xl px-3 py-2 ${
                      isRegistered ? "bg-green-100" : "bg-white"
                    }`}
                  >
                    <Label>
                      {attendee.first_name} {attendee.last_name}
                    </Label>
                    {isRegistered ? (
                      <span className="text-xs text-green-600">
                        Already Added
                      </span>
                    ) : (
                      <Icon
                        icon="mingcute:add-circle-fill"
                        width="20"
                        height="20"
                        className="text-gray-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Children */}
          {children.length > 0 && (
            <div className="rounded-xl border border-primary bg-[#F6F0ED] px-3 py-2">
              <Label className="mb-2 block font-semibold">Children</Label>
              {children.map((attendee) => {
                const isRegistered = registeredAttendees?.some(
                  (r) => r.attendee_id === attendee.attendee_id
                );
                return (
                  <div
                    key={attendee.attendee_id}
                    className={`mb-2 flex items-center justify-between rounded-xl px-3 py-2 ${
                      isRegistered ? "bg-green-100" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-x-2">
                      <Icon icon="mingcute:baby-fill" width="16" height="16" />
                      <Label>
                        {attendee.first_name} {attendee.last_name}
                      </Label>
                    </div>
                    {isRegistered ? (
                      <span className="text-xs text-green-600">
                        Already Added
                      </span>
                    ) : (
                      <Icon
                        icon="mingcute:add-circle-fill"
                        width="20"
                        height="20"
                        className="text-gray-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {parents.length === 0 && children.length === 0 && (
            <Label>No previous attendees found.</Label>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex justify-between">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>

          {/* ✅ Quick attend button excludes already registered */}
          {attendees?.length > 0 && (
            <Button
              onClick={() => onQuickAttend(notRegistered)}
              disabled={isSubmitting || notRegistered.length === 0}
              variant="primary"
            >
              {isSubmitting
                ? "Adding..."
                : notRegistered.length === 0
                  ? "All Already Added"
                  : "Quick Attend All"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

PreviousAttendeesDialog.propTypes = {
  eventName: PropTypes.string.isRequired,
  attendees: PropTypes.arrayOf(
    PropTypes.shape({
      attendee_id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      attendee_type: PropTypes.string.isRequired,
    })
  ),
  registeredAttendees: PropTypes.arrayOf(
    PropTypes.shape({
      attendee_id: PropTypes.string.isRequired,
    })
  ),
  onQuickAttend: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

export default PreviousAttendeesDialog;
