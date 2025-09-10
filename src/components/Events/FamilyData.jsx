import { useState, useEffect } from "react";

import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFamilyData } from "@/hooks/useFamilyData";
import {
  useChildrenManualAttendance,
  useFetchAlreadyRegistered,
  useGuardianManualAttendEvent,
  useRemoveAttendee,
  useGetPreviousAttendees,
} from "@/hooks/useManualAttendEvent";
import Loading from "../Loading";
import PreviousAttendeesDialog from "./PreviousAttendeesDialog";

const AttendeeButton = ({ onClick, children, isPending }) => (
  <Button
    className="rounded-xl bg-[#EFDED6] text-[12px] font-medium text-primary-text"
    onClick={onClick}
    disabled={isPending}
  >
    {isPending ? (
      <Loading />
    ) : (
      <>
        {children}
        <Icon icon="mingcute:add-circle-fill" width="20" height="20" />
      </>
    )}
  </Button>
);

AttendeeButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  isPending: PropTypes.bool,
};

const ParentMemberCard = ({ name, id, onAttend, isPending }) => (
  <div className="mb-2 flex items-center justify-between rounded-xl bg-primary px-3 py-2">
    <Label>{name}</Label>
    <AttendeeButton onClick={() => onAttend(id)} isPending={isPending}>
      Add
    </AttendeeButton>
  </div>
);

ParentMemberCard.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onAttend: PropTypes.func.isRequired,
  isPending: PropTypes.bool,
};

const ChildMemberCard = ({ name, id, onAttend, isPending }) => (
  <div className="mb-2 flex items-center justify-between rounded-xl bg-primary px-3 py-2">
    <div className="flex items-center gap-1">
      <Icon icon="mingcute:baby-fill" width="16" height="16" />
      <Label>{name}</Label>
    </div>
    <AttendeeButton onClick={() => onAttend(id)} isPending={isPending}>
      Add
    </AttendeeButton>
  </div>
);

ChildMemberCard.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  onAttend: PropTypes.func.isRequired,
  isPending: PropTypes.bool,
};

const RegisteredAttendees = ({ attendees, onCancelAttendance, isPending }) => (
  <div className="rounded-xl border border-primary bg-[#F6F0ED] px-3 py-2">
    {attendees?.map((attendee) => (
      <div
        key={attendee.attendee_id}
        className="mb-2 flex items-center justify-between rounded-xl bg-white px-3 py-2"
      >
        <div className="flex items-center gap-x-1">
          {attendee.attendee_type === "children" && (
            <Icon icon="mingcute:baby-fill" width="16" height="16" />
          )}
          <Label>{`${attendee.first_name} ${attendee.last_name}`}</Label>
        </div>

        <Button
          className="rounded-xl bg-[#FFDBE0] text-[12px] font-medium text-[#E31B46]"
          onClick={() => onCancelAttendance(attendee.attendee_id)}
          disabled={isPending}
        >
          Remove
          <Icon icon="mingcute:minus-circle-fill" width="20" height="20" />
        </Button>
      </div>
    ))}
  </div>
);

RegisteredAttendees.propTypes = {
  attendees: PropTypes.arrayOf(
    PropTypes.shape({
      attendee_id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ),
  onCancelAttendance: PropTypes.func.isRequired,
  isPending: PropTypes.bool,
};

const FamilyData = ({ userId, selectedEvent, eventName }) => {
  const [availableParents, setAvailableParents] = useState([]); // Available parents
  const [availableChildren, setAvailableChildren] = useState([]); // Available children
  const [selectedParentId, setSelectedParentId] = useState(null); // Selected parent
  const [selectedChildId, setSelectedChildId] = useState(null); // Selected child
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  const {
    familyId,
    parentData,
    childData,
    isLoading: familyLoading,
    error,
  } = useFamilyData(); // Fetch family

  const { data: previousAttendees } = useGetPreviousAttendees(
    eventName,
    familyId
  );

  const { mutate: removeAttendee, isPending: isRemovingAttendee } =
    useRemoveAttendee(); // Remove attendee
  const { mutate: guardianManualAttend, isPending: isParentSubmitting } =
    useGuardianManualAttendEvent(); // Parent attend event
  const { mutate: childManualAttend, isPending: isChildSubmitting } =
    useChildrenManualAttendance(); // Child attend event
  // Get the parent ids from the parent data
  const parentIds = parentData?.map((parent) => parent.id) || [];
  // Get the parent ids from the parent data
  const childIds = childData?.map((child) => child.id) || [];
  // Combine parent and child ids
  const attendeeIds = [...parentIds, ...childIds];
  // Fetch already registered attendees
  const { data: registeredAttendees, isLoading: registerLoading } =
    useFetchAlreadyRegistered(selectedEvent, attendeeIds);

  // Update availableParents when parentData or registeredAttendees changes
  useEffect(() => {
    if (!parentData || !registeredAttendees) return;

    const filteredParents = parentData.filter(
      (parent) =>
        !registeredAttendees.some(
          (registered) => registered.attendee_id === parent.id
        )
    );
    setAvailableParents(filteredParents);
  }, [parentData, registeredAttendees]);

  useEffect(() => {
    if (!childData || !registeredAttendees) return;

    const filteredChildren = childData.filter(
      (child) =>
        !registeredAttendees.some(
          (registered) => registered.attendee_id === child.id
        )
    );
    setAvailableChildren(filteredChildren);
  }, [childData, registeredAttendees]);

  const isLoading = familyLoading || registerLoading;
  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  // Instead of using all previousAttendees, accept the notRegistered list
  const handleQuickAttendAll = (attendeesToAdd) => {
    if (!attendeesToAdd || attendeesToAdd.length === 0) return;

    setIsQuickSubmitting(true);

    attendeesToAdd.forEach((attendee) => {
      const attendeeData = {
        id: attendee.attendee_id,
        event_id: selectedEvent,
        attendee_type: attendee.attendee_type,
        attended: false,
        main_applicant:
          attendee.attendee_type === "parents" &&
          attendee.attendee_id === userId,
        family_id: familyId,
        first_name: attendee.first_name,
        last_name: attendee.last_name,
        contact_number: attendee.contact_number || null,
        registered_by: userId,
      };

      if (attendee.attendee_type === "parents") {
        guardianManualAttend(attendeeData, {
          onSettled: () => setIsQuickSubmitting(false),
        });
      } else if (attendee.attendee_type === "children") {
        childManualAttend(attendeeData, {
          onSettled: () => setIsQuickSubmitting(false),
        });
      }
    });
  };

  // Function parent attend event
  const handleParentAttend = (parentId) => {
    try {
      // Prevent double submission
      if (selectedParentId) return;

      setSelectedParentId(parentId);
      const parent = parentData.find((p) => p.id === parentId);

      if (!parent) {
        console.error("Parent not found");
        return;
      }

      const attendeeData = {
        id: parent.id,
        event_id: selectedEvent,
        attendee_type: "parents",
        attended: false,
        main_applicant: parent.id === userId,
        family_id: parent.family_id,
        first_name: parent.first_name,
        last_name: parent.last_name,
        contact_number: parent.contact_number,
        registered_by: userId,
      };

      guardianManualAttend(attendeeData, {
        onSettled: () => setSelectedParentId(null),
        onSuccess: () => {
          // Remove the registered parent from availableParents
          setAvailableParents((prev) =>
            prev.filter((parent) => parent.id !== parentId)
          );
        },
      });
    } catch (error) {
      console.error("Error attending parent:", error.message);
    }
  };
  // Function child attend event
  const handleChildAttend = (childId) => {
    try {
      setSelectedChildId(childId);
      const child = childData.find((c) => c.id === childId);
      if (!child) {
        console.error("Child not found");
        return;
      }
      const attendeeData = {
        id: child.id,
        event_id: selectedEvent,
        attendee_type: "children",
        attended: false,
        main_applicant: false,
        family_id: child.family_id,
        first_name: child.first_name,
        last_name: child.last_name,
        registered_by: userId,
      };

      childManualAttend(attendeeData, {
        onSettled: () => setSelectedChildId(null),
        onSuccess: () => {
          // Remove the registered parent from availableParents
          setAvailableChildren((prev) =>
            prev.filter((child) => child.id !== childId)
          );
        },
      });
    } catch (error) {
      console.error("Error attending child:", error.message);
    }
  };

  // Function to cancel attendance
  const handleCancelAttendance = (attendeeId) => {
    removeAttendee({ attendeeId, eventId: selectedEvent });
  };

  return (
    <div>
      {/* ✅ Place at top */}
      <div className="mb-4 flex items-center justify-between">
        <Label className="text-lg font-bold">Previous Attendees</Label>
        <PreviousAttendeesDialog
          eventName={eventName}
          attendees={previousAttendees}
          registeredAttendees={registeredAttendees}
          onQuickAttend={handleQuickAttendAll}
          isSubmitting={isQuickSubmitting}
        />
      </div>

      {/* Parents */}
      <section>
        {availableParents.length > 0 && (
          <>
            <Label className="font-bold">Available Parents/Guardians</Label>
            {availableParents.map((parent) => (
              <ParentMemberCard
                key={parent.id}
                name={`${parent.first_name} ${parent.last_name} ${
                  parent.parishioner_id === userId ? "(You)" : ""
                }`}
                id={parent.id}
                onAttend={handleParentAttend}
                isPending={selectedParentId === parent.id && isParentSubmitting}
              />
            ))}
          </>
        )}
      </section>

      {/* Children */}
      <section className="mt-6">
        {availableChildren.length > 0 && (
          <Label className="font-bold">Available Children</Label>
        )}
        {availableChildren?.map((child) => (
          <ChildMemberCard
            key={child.id}
            name={`${child.first_name} ${child.last_name}`}
            id={child.id}
            onAttend={handleChildAttend}
            isPending={selectedChildId === child.id && isChildSubmitting}
          />
        ))}
      </section>

      {/* Registered */}
      {registeredAttendees.length > 0 && (
        <section className="mt-6">
          <Label className="font-bold">Attendees from your Family</Label>
          <RegisteredAttendees
            attendees={registeredAttendees}
            onCancelAttendance={handleCancelAttendance}
            isPending={isRemovingAttendee}
          />
        </section>
      )}
    </div>
  );
};

FamilyData.propTypes = {
  userId: PropTypes.string.isRequired,
  selectedEvent: PropTypes.string,
  eventName: PropTypes.string,
};
export default FamilyData;
