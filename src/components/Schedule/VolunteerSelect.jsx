import { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { replaceVolunteer } from "@/services/eventService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import CustomReactSelect from "../CustomReactSelect";

const VolunteerSelect = ({
  disableSchedule,
  assignedVolunteers,
  oldVolunteerId,
  volunteers,
  eventId,
  eventVisibility,
  ministryVolunteer,
  admins,
  replaced,
  newreplacement_id,
}) => {
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const volunteersWithAdmin = [...(admins || []), ...(volunteers || [])];

  const previousVolunteerIds = new Set(
    // Create a set of volunteer IDs that have already been replaced
    assignedVolunteers
      .filter((volunteer) => volunteer.replaced) // Filter for volunteers that have been replaced
      .map((volunteer) => volunteer.volunteer_id) // Extract the volunteer_id for those replaced volunteers
  );

  const replacementVolunteerIds = new Set(
    // Create a set of volunteer IDs that are replacements (i.e., volunteers who replaced someone)
    assignedVolunteers
      .filter((volunteer) => volunteer.replaced) // Filter for volunteers that have been replaced
      .map((volunteer) => volunteer.replacedby_id) // Extract the replacedby_id (the ID of the replacement volunteer)
  );

  // Filter the volunteers list to exclude already assigned or replaced volunteers
  const filteredVolunteers = volunteersWithAdmin?.filter(
    (volunteer) =>
      // Include volunteers that are either not yet assigned or are previous replacements
      (!assignedVolunteers.some(
        (assignedVolunteer) => assignedVolunteer.volunteer_id === volunteer.id
      ) ||
        previousVolunteerIds.has(volunteer.id)) &&
      // Exclude volunteers who are currently replacements
      !replacementVolunteerIds.has(volunteer.id)
  );

  const volunteerOptions = filteredVolunteers?.map((volunteer) => ({
    value: volunteer.id,
    label: `${volunteer.first_name} ${volunteer.last_name}`,
  }));

  const replaceVolunteerMutation = useMutation({
    mutationFn: async (data) => replaceVolunteer(data),
    onSuccess: () => {
      toast({
        title: "Volunteer replaced successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error replacing volunteer",
        description:
          error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["event_volunteers", eventId],
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedVolunteer) {
      setError("Please select a volunteer.");
      return;
    }

    replaceVolunteerMutation.mutate({
      oldVolunteerId,
      replacedby_id: selectedVolunteer.value,
      replaced,
      eventId,
      newreplacement_id,
    });
    setVolunteerDialogOpen(false);
  };

  return (
    <Dialog open={volunteerDialogOpen} onOpenChange={setVolunteerDialogOpen}>
      {!disableSchedule && (
        <DialogTrigger>
          <Icon
            className="h-5 w-5 text-accent hover:cursor-pointer"
            icon={"eva:edit-2-fill"}
          />
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Assigned Volunteer</DialogTitle>
          <DialogDescription>Select a volunteer to replace.</DialogDescription>
        </DialogHeader>
        <div>
          <CustomReactSelect
            isMulti={false}
            options={
              eventVisibility === "public"
                ? volunteerOptions
                : ministryVolunteer
            }
            value={selectedVolunteer}
            onChange={setSelectedVolunteer}
            placeholder="Select a Volunteer"
            isClearable
          />
          {error && (
            <div className="mt-2 text-sm font-semibold text-red-500">
              {error}
            </div>
          )}
          <div className="flex justify-end">
            <Button className="mt-2" onClick={handleSubmit}>
              Replace Volunteer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

VolunteerSelect.propTypes = {
  disableSchedule: PropTypes.bool.isRequired,
  assignedVolunteers: PropTypes.arrayOf(
    PropTypes.shape({
      volunteer_id: PropTypes.string.isRequired,
      replaced: PropTypes.bool,
      replacedby_id: PropTypes.string,
    })
  ),
  oldVolunteerId: PropTypes.string.isRequired,
  volunteers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  admins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  eventId: PropTypes.string.isRequired,
  replaced: PropTypes.bool.isRequired,
  newreplacement_id: PropTypes.string,
  eventVisibility: PropTypes.string.isRequired,
  ministryVolunteer: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

export default VolunteerSelect;
