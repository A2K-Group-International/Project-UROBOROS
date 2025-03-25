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
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import CustomReactSelect from "../CustomReactSelect";

const VolunteerSelect = ({
  disableSchedule,
  assignedVolunteers,
  oldVolunteerId,
  eventId,
  volunteerOptions, // This now comes from getVolunteerOptionsForRole()
  replaced,
  newreplacement_id,
}) => {
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  // Filter the incoming volunteerOptions to exclude already assigned volunteers
  const filteredOptions = (volunteerOptions || []).filter((option) => {
    // Always include the current replacement if there is one
    if (option.value === newreplacement_id) {
      return true;
    }

    // Get IDs of volunteers already assigned to this event (and not replaced)
    const assignedVolunteerIds = new Set(
      assignedVolunteers
        ?.filter((vol) => !vol.replaced)
        .map((vol) => vol.volunteer_id)
    );

    // Get IDs of volunteers who are currently acting as replacements
    const replacementVolunteerIds = new Set(
      assignedVolunteers
        ?.filter((vol) => vol.replacedby_id)
        .map((vol) => vol.replacedby_id)
    );

    // Exclude volunteers who are:
    // 1. Already assigned and not replaced, or
    // 2. Currently acting as replacements for other volunteers
    return (
      !assignedVolunteerIds.has(option.value) &&
      !replacementVolunteerIds.has(option.value)
    );
  });

  const replaceVolunteerMutation = useMutation({
    mutationFn: async (data) => replaceVolunteer(data),
    onSuccess: () => {
      toast({
        title: "Volunteer replaced successfully",
      });
      // Clear selection after successful replacement
      setSelectedVolunteer(null);
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
            options={filteredOptions}
            value={selectedVolunteer}
            onChange={(value) => {
              setSelectedVolunteer(value);
              setError(""); // Clear error when selection changes
            }}
            placeholder="Select a Volunteer"
            isClearable
          />
          {error && (
            <div className="mt-2 text-sm font-semibold text-red-500">
              {error}
            </div>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setError("")}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Replace Volunteer</Button>
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
  eventId: PropTypes.string.isRequired,
  eventVisibility: PropTypes.string.isRequired,
  volunteerOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  replaced: PropTypes.bool.isRequired,
  newreplacement_id: PropTypes.string,
};

export default VolunteerSelect;
