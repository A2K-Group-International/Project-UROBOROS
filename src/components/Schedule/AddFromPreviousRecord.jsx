import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useGetPreviousAttendees } from "@/hooks/useManualAttendEvent";
import {
  useAddAttendee,
  useRemoveAttendee,
  useAddWalkInAttendee,
  useRemoveWalkInAttendee,
  useUpdateWalkInAttendee,
} from "@/hooks/Schedule/useAddRecord";
import { useUser } from "@/context/useUser";
import {
  getAttendanceFromExistingRecord,
  updateAttendee,
} from "@/services/attendanceService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AddFromPreviousRecord = ({ eventId, eventName }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingAddAttendeeId, setLoadingAddAttendeeId] = useState(null);
  const [loadingRemoveAttendeeId, setLoadingRemoveAttendeeId] = useState(null);

  const userData = useUser();
  const userId = userData?.userData?.id;
  const queryClient = useQueryClient();

  const { data: previousAttendees = [], isLoading } = useGetPreviousAttendees(
    eventName,
    null, // familyId optional
    eventId
  );

  // Fetch existing attendees for this event
  const { data: attendanceData } = useQuery({
    queryKey: ["event-attendance", eventId],
    queryFn: () => getAttendanceFromExistingRecord(eventId),
    enabled: !!eventId,
  });

  // Track existing attendees and their attendance status
  const {
    existingAttendees,
    attendanceStatus,
    existingWalkInAttendees,
    walkInAttendeeStatus,
  } = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        existingAttendees: new Set(),
        attendanceStatus: new Map(),
        existingWalkInAttendees: new Set(),
        walkInAttendeeStatus: new Map(),
      };
    }

    return {
      // For regular attendees with IDs
      existingAttendees: new Set(
        attendanceData.filter((a) => a.attendee_id).map((a) => a.attendee_id)
      ),
      attendanceStatus: new Map(
        attendanceData
          .filter((a) => a.attendee_id)
          .map((a) => [a.attendee_id, a.attended])
      ),
      // For walk-in attendees without IDs (using name combination)
      existingWalkInAttendees: new Set(
        attendanceData
          .filter((a) => !a.attendee_id)
          .map((a) => `${a.first_name.trim()} ${a.last_name.trim()}`)
      ),
      walkInAttendeeStatus: new Map(
        attendanceData
          .filter((a) => !a.attendee_id)
          .map((a) => [
            `${a.first_name.trim()} ${a.last_name.trim()}`,
            a.attended,
          ])
      ),
    };
  }, [attendanceData]);

  // Mutations
  const { mutate: addAttendeeMutation } = useAddAttendee(eventId, userId);
  const { mutate: removeAttendeeMutation } = useRemoveAttendee(eventId);
  const { mutate: addWalkInAttendeeMutation } = useAddWalkInAttendee(
    eventId,
    userId
  );
  const { mutate: removeWalkInAttendeeMutation } =
    useRemoveWalkInAttendee(eventId);
  const { mutate: updateWalkInAttendeeMutation } =
    useUpdateWalkInAttendee(eventId);

  // Search filter
  const filteredAttendees = useMemo(() => {
    if (!searchTerm) return previousAttendees;
    return previousAttendees.filter((a) =>
      `${a.first_name} ${a.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [previousAttendees, searchTerm]);

  const parents = filteredAttendees.filter(
    (a) => a.attendee_type === "parents"
  );
  const children = filteredAttendees.filter(
    (a) => a.attendee_type === "children"
  );

  // Handle adding attendee with loading state
  const handleAddAttendee = (attendee) => {
    const loadingId =
      attendee.attendee_id || `${attendee.first_name} ${attendee.last_name}`;
    setLoadingAddAttendeeId(loadingId);

    if (attendee.attendee_id) {
      // Regular attendee with ID
      addAttendeeMutation(
        {
          attendeeId: attendee.attendee_id,
          firstName: attendee.first_name,
          lastName: attendee.last_name,
          familyId: attendee.family_id,
          attendeeType: attendee.attendee_type,
        },
        {
          onSettled: () => {
            setTimeout(() => {
              setLoadingAddAttendeeId(null);
            }, 500);
          },
          onError: () => {
            setLoadingAddAttendeeId(null);
          },
        }
      );
    } else {
      // Walk-in attendee without ID
      addWalkInAttendeeMutation(
        {
          firstName: attendee.first_name,
          lastName: attendee.last_name,
          familyId: attendee.family_id,
          contactNumber: attendee.contact_number,
          attendeeType: attendee.attendee_type,
        },
        {
          onSettled: () => {
            setTimeout(() => {
              setLoadingAddAttendeeId(null);
            }, 500);
            queryClient.invalidateQueries(["event-attendance", eventId]);
          },
          onError: () => {
            setLoadingAddAttendeeId(null);
          },
        }
      );
    }
  };

  // Handle removing attendee with loading state
  const handleRemoveAttendee = (attendee) => {
    const loadingId =
      attendee.attendee_id || `${attendee.first_name} ${attendee.last_name}`;
    setLoadingRemoveAttendeeId(loadingId);

    if (attendee.attendee_id) {
      // Regular attendee with ID
      removeAttendeeMutation(attendee.attendee_id, {
        onSettled: () => {
          setTimeout(() => {
            setLoadingRemoveAttendeeId(null);
          }, 500);
        },
        onError: () => {
          setLoadingRemoveAttendeeId(null);
        },
      });
    } else {
      // Walk-in attendee without ID
      removeWalkInAttendeeMutation(
        {
          firstName: attendee.first_name,
          lastName: attendee.last_name,
        },
        {
          onSettled: () => {
            setTimeout(() => {
              setLoadingRemoveAttendeeId(null);
            }, 500);
            queryClient.invalidateQueries(["event-attendance", eventId]);
          },
          onError: () => {
            setLoadingRemoveAttendeeId(null);
          },
        }
      );
    }
  };

  // Update attendee attendance status
  const onAttend = async (attendee, state) => {
    try {
      if (attendee.attendee_id) {
        // Regular attendee with ID
        await updateAttendee(attendee.attendee_id, eventId, state);
      } else {
        // Walk-in attendee without ID
        updateWalkInAttendeeMutation({
          firstName: attendee.first_name,
          lastName: attendee.last_name,
          state,
        });
      }
      await queryClient.invalidateQueries(["attendance", eventId]);
      await queryClient.invalidateQueries(["event-attendance", eventId]);
    } catch (error) {
      console.error("Error updating attendee status:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add from Previous Record</Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar block h-[42rem] overflow-y-scroll sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add from Previous Record</DialogTitle>
          <DialogDescription>
            Quickly add attendees from the last 3 events.
          </DialogDescription>
          <div className="flex h-10 items-center rounded-full bg-primary px-2">
            <SearchIcon className="h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full border-0 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredAttendees.length === 0 ? (
            <Label className="flex items-center justify-center">
              No results
            </Label>
          ) : (
            <>
              {parents.length > 0 && (
                <AttendeeSection
                  title="Parents/Guardians"
                  attendees={parents}
                  existingAttendees={existingAttendees}
                  attendanceStatus={attendanceStatus}
                  existingWalkInAttendees={existingWalkInAttendees}
                  walkInAttendeeStatus={walkInAttendeeStatus}
                  onAdd={handleAddAttendee}
                  onRemove={handleRemoveAttendee}
                  onAttend={onAttend}
                  loadingAddAttendeeId={loadingAddAttendeeId}
                  loadingRemoveAttendeeId={loadingRemoveAttendeeId}
                />
              )}

              {children.length > 0 && (
                <AttendeeSection
                  title="Children"
                  attendees={children}
                  existingAttendees={existingAttendees}
                  attendanceStatus={attendanceStatus}
                  existingWalkInAttendees={existingWalkInAttendees}
                  walkInAttendeeStatus={walkInAttendeeStatus}
                  onAdd={handleAddAttendee}
                  onRemove={handleRemoveAttendee}
                  onAttend={onAttend}
                  loadingAddAttendeeId={loadingAddAttendeeId}
                  loadingRemoveAttendeeId={loadingRemoveAttendeeId}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AttendeeSection = ({
  title,
  attendees,
  existingAttendees,
  attendanceStatus,
  existingWalkInAttendees,
  walkInAttendeeStatus,
  onAdd,
  onRemove,
  onAttend,
  loadingAddAttendeeId,
  loadingRemoveAttendeeId,
}) => (
  <div className="space-y-2 rounded-lg bg-primary p-2">
    <Label className="text-primary-text">{title}</Label>
    <ul className="space-y-2">
      {attendees.map((a) => {
        const loadingId = a.attendee_id || `${a.first_name} ${a.last_name}`;
        const nameKey = `${a.first_name} ${a.last_name}`;

        // Check if attendee exists (either by ID or name for walk-ins)
        const isExistingAttendee = a.attendee_id
          ? existingAttendees.has(a.attendee_id)
          : existingWalkInAttendees.has(nameKey);

        // Get attendance status (either by ID or name for walk-ins)
        const attendanceState = a.attendee_id
          ? attendanceStatus.get(a.attendee_id)
          : walkInAttendeeStatus.get(nameKey);

        return (
          <li
            key={loadingId}
            className="rounded-lg bg-white px-5 py-1 text-primary-text"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                {isExistingAttendee && (
                  <Switch
                    checked={attendanceState}
                    onCheckedChange={(checked) => onAttend(a, checked)}
                  />
                )}
                <Label>
                  {a.first_name} {a.last_name}
                  {!a.attendee_id && (
                    <span className="text-gray-500 ml-2 text-xs">
                      (Walk-in)
                    </span>
                  )}
                </Label>
              </div>
              <div>
                {isExistingAttendee ? (
                  <Button
                    disabled={loadingRemoveAttendeeId === loadingId}
                    onClick={() => onRemove(a)}
                    className="rounded-xl bg-red-100 text-[12px] text-red-600"
                  >
                    {loadingRemoveAttendeeId === loadingId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled={loadingAddAttendeeId === loadingId}
                    className="rounded-xl bg-[#EFDED6] text-[12px] text-primary-text"
                    onClick={() => onAdd(a)}
                  >
                    {loadingAddAttendeeId === loadingId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

AttendeeSection.propTypes = {
  title: PropTypes.string.isRequired,
  attendees: PropTypes.array.isRequired,
  existingAttendees: PropTypes.instanceOf(Set).isRequired,
  attendanceStatus: PropTypes.instanceOf(Map).isRequired,
  existingWalkInAttendees: PropTypes.instanceOf(Set).isRequired,
  walkInAttendeeStatus: PropTypes.instanceOf(Map).isRequired,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onAttend: PropTypes.func.isRequired,
  loadingAddAttendeeId: PropTypes.string,
  loadingRemoveAttendeeId: PropTypes.string,
};

const SearchIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

AddFromPreviousRecord.propTypes = {
  eventId: PropTypes.string.isRequired,
  eventName: PropTypes.string.isRequired,
};

export default AddFromPreviousRecord;
