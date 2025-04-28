import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState, memo } from "react";

import { Description, Title } from "@/components/Title";
import {
  getMeetingById,
  fetchMeetingParticipants,
} from "@/services/meetingService";
import { Label } from "../ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import useDeleteMeeting from "@/hooks/useDeleteMeeting";
import Loading from "../Loading";

const MeetingDetails = () => {
  const [urlPrms] = useSearchParams();
  const meetingId = urlPrms.get("meeting");

  const { data: meeting, isLoading } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: async () => {
      const response = await getMeetingById(meetingId);
      return response;
    },
    enabled: !!meetingId,
  });

  const { data: participants, isLoading: participantsLoading } = useQuery({
    queryKey: ["meetingParticipants", meetingId],
    queryFn: async () => {
      const response = await fetchMeetingParticipants(meetingId);
      return response; // The full response object
    },
    enabled: !!meetingId, // Only fetch when meetingId is available
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use the delete meeting hook
  const { mutate: deleteMeeting, isLoading: isDeleting } = useDeleteMeeting();

  if (isLoading) return <Loading />;

  if (!meetingId)
    return (
      <div className="grid grow place-items-center rounded-2xl outline outline-2 outline-[#e7dad3]">
        <Description>Select a Meeting to view and configure</Description>
      </div>
    );

  const formatTime = (time) => {
    if (!time) return ""; // Handle null/undefined cases
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0 or 12 to 12 for 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="no-scrollbar h-full grow flex-col gap-8 overflow-y-auto px-9 py-6 lg:flex">
      <div className="relative flex justify-between">
        <div>
          <Title>{meeting?.meeting_name}</Title>
          <Description>
            {meeting?.details || "No details provided."}
          </Description>
          <div>
            <p>
              <Label className="text-primary-text">
                <strong>Meeting Date: </strong>
                {meeting?.meeting_date &&
                  new Date(meeting.meeting_date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
              </Label>
            </p>
            <p>
              <Label className="text-primary-text">
                <strong>Time:</strong> {formatTime(meeting?.start_time)}
              </Label>
            </p>

            <p>
              <Label className="text-primary-text">
                <strong>Location:</strong>{" "}
                {meeting?.location || "Not specified"}
              </Label>
            </p>
          </div>
        </div>

        {/* Delete Button positioned at the top-right */}
        <Button
          className="rounded-xl px-3 py-3"
          onClick={() => setIsDialogOpen(true)} // Open the confirmation dialog
        >
          <Icon icon={"mingcute:delete-3-line"} />
        </Button>
      </div>

      {/* Dialog Modal for Delete Confirmation */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="z-60 rounded-lg bg-white p-6">
            <h3 className="text-lg font-bold">Are you sure?</h3>
            <p>
              Do you really want to delete this meeting? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteMeeting(meetingId);
                  setIsDialogOpen(false);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Display Participants */}
      {participantsLoading ? (
        <div>Loading participants...</div>
      ) : participants?.success && participants?.data?.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-montserrat font-bold text-accent">
              Participants List
            </CardTitle>
            <CardDescription className="sr-only">
              Meeting Participants
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Table>
              <TableHeader className="bg-primary">
                <TableRow>
                  <TableHead className="rounded-l-lg">
                    Name of Attendee
                  </TableHead>
                  <TableHead className="rounded-r-lg">Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.data.map((participant) => (
                  <TableRow
                    key={participant.user_id}
                    className="bg-white odd:bg-primary odd:bg-opacity-35"
                  >
                    <TableCell>{`${participant.users.first_name} ${participant.users.last_name}`}</TableCell>
                    <TableCell>{participant.users.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div>No participants found</div>
      )}
    </div>
  );
};

export default memo(MeetingDetails);
