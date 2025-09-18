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
import PreviousAttendeesPanel from "./PreviousAttendeesPanel"; // ✅ replaced dialog

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
  const [availableParents, setAvailableParents] = useState([]);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  const {
    familyId,
    parentData,
    childData,
    isLoading: familyLoading,
    error,
  } = useFamilyData();

  const { data: previousAttendees } = useGetPreviousAttendees(
    eventName,
    familyId
  );

  const { mutate: removeAttendee, isPending: isRemovingAttendee } =
    useRemoveAttendee();
  const { mutate: guardianManualAttend, isPending: isParentSubmitting } =
    useGuardianManualAttendEvent();
  const { mutate: childManualAttend, isPending: isChildSubmitting } =
    useChildrenManualAttendance();

  const parentIds = parentData?.map((parent) => parent.id) || [];
  const childIds = childData?.map((child) => child.id) || [];
  const attendeeIds = [...parentIds, ...childIds];

  const { data: registeredAttendees, isLoading: registerLoading } =
    useFetchAlreadyRegistered(selectedEvent, attendeeIds);

  useEffect(() => {
    if (!parentData || !registeredAttendees) return;
    setAvailableParents(
      parentData.filter(
        (parent) =>
          !registeredAttendees.some(
            (registered) => registered.attendee_id === parent.id
          )
      )
    );
  }, [parentData, registeredAttendees]);

  useEffect(() => {
    if (!childData || !registeredAttendees) return;
    setAvailableChildren(
      childData.filter(
        (child) =>
          !registeredAttendees.some(
            (registered) => registered.attendee_id === child.id
          )
      )
    );
  }, [childData, registeredAttendees]);

  const isLoading = familyLoading || registerLoading;
  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

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

  const handleParentAttend = (parentId) => {
    if (selectedParentId) return;
    setSelectedParentId(parentId);

    const parent = parentData.find((p) => p.id === parentId);
    if (!parent) return;

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
      onSuccess: () =>
        setAvailableParents((prev) => prev.filter((p) => p.id !== parentId)),
    });
  };

  const handleChildAttend = (childId) => {
    setSelectedChildId(childId);

    const child = childData.find((c) => c.id === childId);
    if (!child) return;

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
      onSuccess: () =>
        setAvailableChildren((prev) => prev.filter((c) => c.id !== childId)),
    });
  };

  const handleCancelAttendance = (attendeeId) => {
    removeAttendee({ attendeeId, eventId: selectedEvent });
  };

  return (
    <div>
      {/* ✅ New Panel at Top */}
      <PreviousAttendeesPanel
        eventName={eventName}
        attendees={previousAttendees}
        registeredAttendees={registeredAttendees}
        onQuickAttend={handleQuickAttendAll}
        isSubmitting={isQuickSubmitting}
      />

      {/* Parents */}
      <section className="mt-6">
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
        {availableChildren.map((child) => (
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
      {registeredAttendees?.length > 0 && (
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
