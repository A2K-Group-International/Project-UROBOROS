import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import Loading from "../Loading";

const PreviousAttendeesPanel = ({
  eventName,
  attendees,
  registeredAttendees,
  onQuickAttend,
  isSubmitting,
}) => {
  const parents = attendees?.filter((a) => a.attendee_type === "parents") || [];
  const children =
    attendees?.filter((a) => a.attendee_type === "children") || [];

  // Only those not already registered
  const notRegistered =
    attendees?.filter(
      (a) => !registeredAttendees?.some((r) => r.attendee_id === a.attendee_id)
    ) || [];

  return (
    <div className="space-y-4 rounded-xl border border-primary bg-[#F6F0ED] px-3 py-4">
      {/* Header */}
      <div>
        <Label className="font-bold">Previous Attendees</Label>
        <p className="text-gray-600 text-sm">
          From the last 3 {eventName} events
        </p>
      </div>

      {/* Parents */}
      {parents.length > 0 && (
        <div>
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
                className="mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-2"
              >
                <Label>
                  {attendee.first_name} {attendee.last_name}
                </Label>

                {isRegistered ? (
                  <span className="rounded-xl bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
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
        <div>
          <Label className="mb-2 block font-semibold">Children</Label>
          {children.map((attendee) => {
            const isRegistered = registeredAttendees?.some(
              (r) => r.attendee_id === attendee.attendee_id
            );

            return (
              <div
                key={attendee.attendee_id}
                className="mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-2"
              >
                <div className="flex items-center gap-x-2">
                  <Icon icon="mingcute:baby-fill" width="16" height="16" />
                  <Label>
                    {attendee.first_name} {attendee.last_name}
                  </Label>
                </div>

                {isRegistered ? (
                  <span className="rounded-xl bg-green-100 px-2 py-1 text-xs font-medium text-green-600">
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

      {/* Empty State */}
      {parents.length === 0 && children.length === 0 && (
        <Label>No previous attendees found.</Label>
      )}

      {/* Footer */}
      {attendees?.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={() => onQuickAttend(notRegistered)}
            disabled={isSubmitting || notRegistered.length === 0}
            className="rounded-xl bg-[#EFDED6] text-sm font-medium text-primary-text"
          >
            {isSubmitting ? (
              <Loading />
            ) : notRegistered.length === 0 ? (
              "All Already Added"
            ) : (
              "Quick Attend All"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

PreviousAttendeesPanel.propTypes = {
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

export default PreviousAttendeesPanel;
