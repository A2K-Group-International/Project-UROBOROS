import PropTypes from "prop-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useGroups from "@/hooks/useGroups";
import useSubgroups from "@/hooks/useSubgroups";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Icon } from "@iconify/react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsersByRole } from "@/services/userService";
import { ROLES } from "@/constants/roles";
import CustomReactSelect from "../CustomReactSelect";
import { useUser } from "@/context/useUser";
import useMinistry from "@/hooks/useMinistry";
import TransferMember from "./TransferMember";

const addMembersSchema = z.object({
  members: z.array(z.string()).min(1, "Please select at least one member"),
});

const GroupMembers = ({
  ministryId,
  groupId,
  subgroupId,
  assignedMinistry,
}) => {
  const { userData } = useUser();
  const currentUserId = userData?.id;

  // Use the appropriate hook based on whether we're viewing a group or subgroup
  const { groupmembers, removeGroupMembersMutation } = useGroups({ groupId });
  const { subgroupmembers, removeSubgroupMembersMutation } = useSubgroups({
    subgroupId,
  });

  // Determine if we're viewing a subgroup or main group
  const isSubgroup = !!subgroupId;

  // Get members data from the appropriate source
  const membersQuery = isSubgroup ? subgroupmembers : groupmembers;

  // Get ministry coordinators to check if current user is a coordinator
  const { coordinators: ministryCoordinatorsQuery } = useMinistry({
    ministryId,
  });

  // Check if current user is a coordinator for this ministry
  const isCoordinator = useMemo(() => {
    if (
      !ministryCoordinatorsQuery.data ||
      !Array.isArray(ministryCoordinatorsQuery.data) ||
      !currentUserId
    ) {
      return false;
    }

    return ministryCoordinatorsQuery.data.some(
      (coordinator) =>
        coordinator.users?.id === currentUserId ||
        coordinator.coordinator_id === currentUserId
    );
  }, [ministryCoordinatorsQuery.data, currentUserId]);

  // Extract data and loading state
  const { data: members = [], isLoading: membersLoading } = membersQuery || {};

  // Format date helper function
  const formatJoinedDate = (dateString) => {
    if (!dateString) return "Join date unknown";
    const date = new Date(dateString);
    return `Added on ${format(date, "dd-MMM-yyyy, HH:mm")}`;
  };

  return (
    <div className="h-dvh bg-primary px-10 py-4">
      <div className="mb-4 flex items-center justify-between">
        <Label className="text-lg font-medium">Members</Label>
        {/* Only show Add Members button if user is a coordinator */}
        {isCoordinator &&
          (isSubgroup ? (
            <AddSubgroupMembersForm
              ministryId={ministryId}
              groupId={groupId}
              subgroupId={subgroupId}
            />
          ) : (
            <AddGroupMembersForm ministryId={ministryId} groupId={groupId} />
          ))}
      </div>
      {membersLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        members?.map((item) => {
          // Handle the different data structure between group and subgroup members
          const member = isSubgroup ? item.users : item.users;
          const joinedAt = item.joined_at;

          return (
            <div key={member.id}>
              <ul className="mt-2">
                <li className="mb-2 rounded-xl bg-white/50 px-4 py-6 shadow-md">
                  <div className="group flex items-center justify-between px-6">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback className="bg-primary-outline/60 text-primary-text">
                          {member.first_name?.charAt(0)}
                          {member.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <Label className="font-medium">
                          {member.first_name} {member.last_name}
                        </Label>
                        <span className="text-muted-foreground text-xs">
                          {formatJoinedDate(joinedAt)}
                        </span>
                      </div>
                    </div>
                    {isCoordinator && (
                      <div>
                        {isSubgroup ? (
                          <RemoveSubgroupMember
                            userId={member.id}
                            subgroupId={subgroupId}
                            memberName={`${member.first_name} ${member.last_name}`}
                            removeSubgroupMembersMutation={
                              removeSubgroupMembersMutation
                            }
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <TransferMember
                              userId={member.id}
                              groupId={groupId}
                              firstName={member.first_name}
                              lastName={member.last_name}
                              assignedMinistry={assignedMinistry}
                            />
                            <RemoveGroupMember
                              userId={member.id}
                              groupId={groupId}
                              memberName={`${member.first_name} ${member.last_name}`}
                              removeGroupMembersMutation={
                                removeGroupMembersMutation
                              }
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
};

GroupMembers.propTypes = {
  ministryId: PropTypes.string,
  groupId: PropTypes.string,
  subgroupId: PropTypes.string,
  assignedMinistry: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      image_url: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      ministry_name: PropTypes.string.isRequired,
      ministry_description: PropTypes.string,
    })
  ),
};

const AddGroupMembersForm = ({ ministryId, groupId }) => {
  const [open, setOpen] = useState(false);

  const { userData } = useUser();

  // Get the current group members
  const { groupmembers, addGroupMembersMutation } = useGroups({ groupId });
  const { data: currentMembers = [] } = groupmembers || {};

  const { coordinators: ministryCoordinatorsQuery } = useMinistry({
    ministryId,
  });

  // Extract the user IDs of existing members
  const existingMemberIds = useMemo(() => {
    return currentMembers.map((member) => member.users?.id).filter(Boolean);
  }, [currentMembers]);

  // Fetch potential members by role
  const { data: coparents = [], isLoading: coparentsLoading } = useQuery({
    queryKey: ["coparent"],
    queryFn: async () => getUsersByRole(ROLES[3]),
  });

  const { data: parishioners = [], isLoading: parishionerLoading } = useQuery({
    queryKey: ["parishioner"],
    queryFn: async () => getUsersByRole(ROLES[2]),
  });

  const { data: volunteers = [], isLoading: volunteersLoading } = useQuery({
    queryKey: ["volunteer"],
    queryFn: async () => getUsersByRole(ROLES[1]),
  });

  const { data: coordinators = [], isLoading: coordinatorsLoading } = useQuery({
    queryKey: ["coordinator"],
    queryFn: async () => getUsersByRole(ROLES[0]),
  });

  const { data: admins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ["admin"],
    queryFn: async () => getUsersByRole(ROLES[4]),
  });

  // Get ministry coordinator IDs in a convenient format
  const ministryCoordinatorIds = useMemo(() => {
    if (
      !ministryCoordinatorsQuery.data ||
      !Array.isArray(ministryCoordinatorsQuery.data)
    ) {
      return new Set();
    }

    // Extract user IDs from the nested structure
    const coordinatorUserIds = ministryCoordinatorsQuery.data
      .map((coordinator) => coordinator.users?.id)
      .filter((id) => id != null);

    return new Set(coordinatorUserIds);
  }, [ministryCoordinatorsQuery.data]);

  const isLoadingMembers =
    coparentsLoading ||
    parishionerLoading ||
    volunteersLoading ||
    coordinatorsLoading ||
    adminsLoading ||
    ministryCoordinatorsQuery.isLoading;

  // Filter out users who are already coordinators in this ministry
  const filteredGroupMembers = useMemo(() => {
    // Combine all potential members
    const allMembers = [
      ...(coparents || []),
      ...(volunteers || []),
      ...(parishioners || []),
      ...(coordinators || []),
      ...(admins || []),
    ];

    // Filter out duplicates by ID (in case users appear in multiple role lists)
    const uniqueMembers = Array.from(
      new Map(allMembers.map((user) => [user.id, user])).values()
    );

    // Filter out users who are coordinators for this ministry
    // Also filter out current user
    const filtered = uniqueMembers.filter((user) => {
      const isCoordinator = ministryCoordinatorIds.has(user.id);
      const isCurrentUser = user.id === userData?.id;
      return !isCoordinator && !isCurrentUser;
    });

    return filtered;
  }, [
    coparents,
    volunteers,
    parishioners,
    coordinators,
    admins,
    ministryCoordinatorIds,
    userData?.id,
  ]);

  // Filter out users who are already members of the group
  const availableMembers = useMemo(() => {
    return filteredGroupMembers.filter(
      (user) => !existingMemberIds.includes(user.id)
    );
  }, [filteredGroupMembers, existingMemberIds]);

  // Update to use availableMembers instead of filteredGroupMembers
  const memberOptions = useMemo(() => {
    return availableMembers.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    }));
  }, [availableMembers]);

  const form = useForm({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      members: [],
    },
  });

  const isAddingMembers = addGroupMembersMutation.isPending;

  const onSubmit = (data) => {
    if (!data.members.length) {
      return;
    }

    addGroupMembersMutation.mutate(
      {
        groupId,
        members: data.members,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-primary-outline text-xs font-medium text-primary-text">
          Add Members
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Members to Group</AlertDialogTitle>
          <AlertDialogDescription>
            {availableMembers.length === 0 && !isLoadingMembers
              ? "All available users are already members of this group."
              : "Select users you want to add to this group."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="form"
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Members
                      {isLoadingMembers && (
                        <span className="ml-2 inline-block h-4 w-4">
                          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <CustomReactSelect
                        isLoading={isLoadingMembers}
                        onChange={(selectedOptions) =>
                          field.onChange(
                            selectedOptions?.map((option) => option.value) || []
                          )
                        }
                        options={memberOptions}
                        value={memberOptions.filter((option) =>
                          field.value?.includes(option.value)
                        )}
                        placeholder={
                          isLoadingMembers
                            ? "Loading members..."
                            : availableMembers.length === 0
                              ? "No available members"
                              : "Select Members..."
                        }
                        isMulti
                        isDisabled={
                          isLoadingMembers || availableMembers.length === 0
                        }
                        noOptionsMessage={() =>
                          "All users are already in this group"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isAddingMembers}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="submit"
            disabled={isAddingMembers || availableMembers.length === 0}
            className="flex-1"
            form="form"
          >
            {isAddingMembers ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Done"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AddGroupMembersForm.propTypes = {
  ministryId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
};

// Add Subgroup Members Form
const AddSubgroupMembersForm = ({ groupId, subgroupId }) => {
  const [open, setOpen] = useState(false);

  // Get the current subgroup members
  const { subgroupmembers, addSubgroupMembersMutation } = useSubgroups({
    subgroupId,
  });

  // Get the current group members
  const { groupmembers } = useGroups({ groupId });

  // Extract data and loading states
  const {
    data: currentSubgroupMembers = [],
    isLoading: isLoadingSubgroupMembers,
  } = subgroupmembers;

  const { data: groupMembers = [], isLoading: isLoadingGroupMembers } =
    groupmembers;

  // Extract the user IDs of existing subgroup members
  const existingSubgroupMemberIds = useMemo(() => {
    return currentSubgroupMembers
      .map((member) => member.users?.id)
      .filter(Boolean);
  }, [currentSubgroupMembers]);

  // Filter out users who are already in the subgroup and create selection options
  const availableMembers = useMemo(() => {
    if (!groupMembers || groupMembers.length === 0) {
      return [];
    }

    const filtered = groupMembers
      .filter((item) => {
        const userId = item.users?.id;
        const isAlreadyMember = existingSubgroupMemberIds.includes(userId);
        return userId && !isAlreadyMember;
      })
      .map((item) => item.users)
      .filter(Boolean);

    return filtered;
  }, [groupMembers, existingSubgroupMemberIds]);

  // Member options for select dropdown
  const memberOptions = useMemo(() => {
    return availableMembers.map((user) => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name}`,
    }));
  }, [availableMembers]);

  const form = useForm({
    resolver: zodResolver(addMembersSchema),
    defaultValues: {
      members: [],
    },
  });

  const isAddingMembers = addSubgroupMembersMutation.isPending;
  const isLoadingMembers = isLoadingGroupMembers || isLoadingSubgroupMembers;

  const onSubmit = (data) => {
    if (!data.members.length) {
      return;
    }

    addSubgroupMembersMutation.mutate(
      {
        subgroupId,
        members: data.members,
      },
      {
        onSuccess: () => {
          setOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-primary-outline text-xs font-medium text-primary-text">
          Add Members
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Members to Subgroup</AlertDialogTitle>
          <AlertDialogDescription>
            {availableMembers.length === 0 && !isLoadingMembers
              ? "All group members are already in this subgroup."
              : "Select group members you want to add to this subgroup."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="subgroup-form"
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Members
                      {isLoadingMembers && (
                        <span className="ml-2 inline-block h-4 w-4">
                          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <CustomReactSelect
                        isLoading={isLoadingMembers}
                        onChange={(selectedOptions) =>
                          field.onChange(
                            selectedOptions?.map((option) => option.value) || []
                          )
                        }
                        options={memberOptions}
                        value={memberOptions.filter((option) =>
                          field.value?.includes(option.value)
                        )}
                        placeholder={
                          isLoadingMembers
                            ? "Loading members..."
                            : availableMembers.length === 0
                              ? "No available members"
                              : "Select Members..."
                        }
                        isMulti
                        isDisabled={
                          isLoadingMembers || availableMembers.length === 0
                        }
                        noOptionsMessage={() =>
                          "All group members are already in this subgroup"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isAddingMembers}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="submit"
            disabled={isAddingMembers || availableMembers.length === 0}
            className="flex-1"
            form="subgroup-form"
          >
            {isAddingMembers ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Done"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

AddSubgroupMembersForm.propTypes = {
  ministryId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  subgroupId: PropTypes.string.isRequired,
};

// Rename to make the purpose clearer
const RemoveGroupMember = ({
  userId,
  groupId,
  memberName,
  removeGroupMembersMutation,
}) => {
  const [open, setOpen] = useState(false);

  const handleRemoveMembers = () => {
    removeGroupMembersMutation.mutate(
      { userId, groupId },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-destructive hover:bg-destructive/10 rounded-full p-1 transition-colors"
          type="button"
        >
          <Icon icon="mingcute:minus-circle-fill" className="h-5 w-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{memberName}</strong> from
            this group?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeGroupMembersMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveMembers}
            disabled={removeGroupMembersMutation.isPending}
          >
            {removeGroupMembersMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

RemoveGroupMember.propTypes = {
  userId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  memberName: PropTypes.string.isRequired,
  removeGroupMembersMutation: PropTypes.object.isRequired,
};

// Component to remove subgroup members
const RemoveSubgroupMember = ({
  userId,
  subgroupId,
  memberName,
  removeSubgroupMembersMutation,
}) => {
  const [open, setOpen] = useState(false);

  const handleRemoveMember = () => {
    removeSubgroupMembersMutation.mutate(
      { userId, subgroupId },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-destructive hover:bg-destructive/10 rounded-full p-1 transition-colors"
          type="button"
        >
          <Icon icon="mingcute:minus-circle-fill" className="h-5 w-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{memberName}</strong> from
            this subgroup?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={removeSubgroupMembersMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemoveMember}
            disabled={removeSubgroupMembersMutation.isPending}
          >
            {removeSubgroupMembersMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

RemoveSubgroupMember.propTypes = {
  userId: PropTypes.string.isRequired,
  subgroupId: PropTypes.string.isRequired,
  memberName: PropTypes.string.isRequired,
  removeSubgroupMembersMutation: PropTypes.object.isRequired,
};

export default GroupMembers;
