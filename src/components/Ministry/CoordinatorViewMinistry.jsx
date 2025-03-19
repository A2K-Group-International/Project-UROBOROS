import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { Label } from "../ui/label";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import {
  getAssignedMinistries,
  getMinistryGroups,
} from "@/services/ministryService";
import { useUser } from "@/context/useUser";
import useGroups from "@/hooks/useGroups";
import ConfigureGroup from "./ConfigureGroup";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import GroupAnnouncements from "./GroupAnnouncements";
import GroupMembers from "./GroupMembers";
import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom hook for ministries where user is a coordinator
const useAssignedMinistries = (userId) => {
  return useQuery({
    queryKey: ["assigned-ministries", userId],
    queryFn: () => getAssignedMinistries(userId),
    enabled: !!userId,
  });
};

// Custom hook for groups where user is a member
const useUserGroups = (userId) => {
  return useQuery({
    queryKey: ["user-groups", userId],
    queryFn: () => getMinistryGroups(userId),
    enabled: !!userId,
  });
};

// Component to display ministry with group count
const MinistryItem = ({
  ministry,
  isExpanded,
  onToggle,
  selectedGroup,
  onSelectGroup,
}) => {
  // Fetch groups
  const {
    groups: { data: groups = [] },
    isLoading: isLoadingGroups,
  } = useGroups({
    ministryId: ministry.id,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-primary-outline">
      <div
        className="flex cursor-pointer items-center p-4 hover:bg-primary/5"
        onClick={onToggle}
      >
        <div className="mr-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-primary-text" />
          ) : (
            <ChevronRight className="h-4 w-4 text-primary-text" />
          )}
        </div>
        <div className="mr-3">
          <Avatar className="flex h-10 w-10 justify-center rounded-[4px] bg-primary">
            <AvatarImage
              className="h-10 w-10 rounded-[4px] object-cover"
              src={ministry.image_url}
              alt="profile picture"
            />
            <AvatarFallback className="h-10 w-10 rounded-[4px] bg-primary">
              {getInitial(ministry.ministry_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{ministry.ministry_name}</h3>
          <p className="text-muted-foreground text-sm">
            {isLoadingGroups ? (
              <Loader2 className="inline h-3 w-3 animate-spin" />
            ) : (
              `${groups.length} Groups`
            )}
          </p>
        </div>
        <div>
          <ConfigureGroup
            ministryId={ministry.id}
            ministryName={ministry.ministry_name}
            ministryDescription={ministry.ministry_description}
          />
        </div>
      </div>

      {isExpanded && (
        <MinistryGroups
          ministryId={ministry.id}
          selectedGroup={selectedGroup}
          onSelectGroup={onSelectGroup}
          groups={groups}
          isLoading={isLoadingGroups}
        />
      )}
    </div>
  );
};

MinistryItem.propTypes = {
  ministry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    ministry_name: PropTypes.string.isRequired,
    ministry_description: PropTypes.string,
    image_url: PropTypes.string,
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  selectedGroup: PropTypes.string,
  onSelectGroup: PropTypes.func.isRequired,
};

// MinistryGroups component update for responsive design
const MinistryGroups = ({
  ministryId,
  selectedGroup,
  onSelectGroup,
  groups,
  isLoading,
}) => {
  // If groups aren't passed, fetch them
  const groupsQuery = useGroups({ ministryId });
  const groupsData = groups || groupsQuery.groups?.data || [];
  const loading = isLoading || groupsQuery.isLoading;

  if (loading) {
    return (
      <div className="flex justify-center px-4 pb-4">
        <div className="h-4 w-4 animate-spin rounded-full border border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (groupsData.length === 0) {
    return (
      <div className="text-muted-foreground px-4 pb-4 text-center text-sm">
        No groups created yet.
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <div className="space-y-1 pl-9">
        {groupsData.map((group) => (
          <div key={group.id}>
            {/* Mobile View using Sheet */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger
                  className={`w-full cursor-pointer rounded-lg px-4 py-2 text-left ${
                    selectedGroup === group.id
                      ? "bg-primary font-bold text-primary-text"
                      : "hover:bg-primary/5"
                  }`}
                >
                  {group.name}
                </SheetTrigger>
                <SheetContent className="w-full">
                  <SheetHeader>
                    <SheetTitle>{group.name}</SheetTitle>
                    <SheetDescription>{group.description}</SheetDescription>
                  </SheetHeader>

                  {/* Mobile Tabs */}
                  <Tabs defaultValue="announcement" className="h-full">
                    <TabsList className="mb-4 grid w-full grid-cols-2">
                      <TabsTrigger value="announcement">
                        Announcements
                      </TabsTrigger>
                      <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="announcement"
                      className="no-scrollbar h-[calc(100%-60px)] overflow-y-auto"
                    >
                      <GroupAnnouncements
                        ministryId={ministryId}
                        groupId={group.id}
                      />
                    </TabsContent>

                    <TabsContent
                      value="members"
                      className="no-scrollbar h-[calc(100%-60px)] overflow-y-auto"
                    >
                      <GroupMembers
                        ministryId={ministryId}
                        groupId={group.id}
                      />
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop View */}
            <div
              className={`hidden cursor-pointer rounded-lg px-4 py-2 lg:block ${
                selectedGroup === group.id ? "bg-primary" : "hover:bg-primary/5"
              }`}
              onClick={() => onSelectGroup(group)}
            >
              <span
                className={
                  selectedGroup === group.id
                    ? "font-bold text-primary-text"
                    : ""
                }
              >
                {group.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

MinistryGroups.propTypes = {
  ministryId: PropTypes.string.isRequired,
  selectedGroup: PropTypes.string,
  onSelectGroup: PropTypes.func.isRequired,
  groups: PropTypes.array,
  isLoading: PropTypes.bool,
};

MinistryGroups.defaultProps = {
  groups: [],
  isLoading: false,
  selectedGroup: null,
};

// Define MemberMinistryItem component for member groups
const MemberMinistryItem = ({
  ministry,
  isExpanded,
  onToggle,
  selectedGroup,
  onSelectGroup,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-primary-outline">
      <div
        className="flex cursor-pointer items-center p-4 hover:bg-primary/5"
        onClick={onToggle}
      >
        <div className="mr-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-primary-text" />
          ) : (
            <ChevronRight className="h-4 w-4 text-primary-text" />
          )}
        </div>
        <div className="mr-3">
          <Avatar>
            <AvatarFallback>
              {ministry.ministry_name?.substring(0, 2).toUpperCase() || "MN"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{ministry.ministry_name}</h3>
          <p className="text-muted-foreground text-sm">
            {`${ministry.groups?.length || 0} Groups`}
          </p>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="space-y-1 pl-9">
            {ministry.groups.map((group) => (
              <div key={group.group_id}>
                {/* Mobile View using Sheet */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger
                      className={`w-full cursor-pointer rounded-lg px-4 py-2 text-left ${
                        selectedGroup === group.group_id
                          ? "bg-primary font-bold text-primary-text"
                          : "hover:bg-primary/5"
                      }`}
                    >
                      {group.group_name}
                    </SheetTrigger>
                    <SheetContent className="w-full">
                      <SheetHeader>
                        <SheetTitle>{group.group_name}</SheetTitle>
                        <SheetDescription>{group.description}</SheetDescription>
                      </SheetHeader>

                      {/* Mobile Tabs */}
                      <Tabs defaultValue="announcement" className="h-full">
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                          <TabsTrigger value="announcement">
                            Announcements
                          </TabsTrigger>
                          <TabsTrigger value="members">Members</TabsTrigger>
                        </TabsList>

                        <TabsContent
                          value="announcement"
                          className="no-scrollbar h-[calc(100%-60px)] overflow-y-auto"
                        >
                          <GroupAnnouncements
                            ministryId={ministry.ministry_id}
                            groupId={group.group_id}
                          />
                        </TabsContent>

                        <TabsContent
                          value="members"
                          className="no-scrollbar h-[calc(100%-60px)] overflow-y-auto"
                        >
                          <GroupMembers
                            ministryId={ministry.ministry_id}
                            groupId={group.group_id}
                          />
                        </TabsContent>
                      </Tabs>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Desktop View */}
                <div
                  className={`hidden cursor-pointer rounded-lg px-4 py-2 lg:block ${
                    selectedGroup === group.group_id
                      ? "bg-primary"
                      : "hover:bg-primary/5"
                  }`}
                  onClick={() => onSelectGroup(group)}
                >
                  <span
                    className={
                      selectedGroup === group.group_id
                        ? "font-bold text-primary-text"
                        : ""
                    }
                  >
                    {group.group_name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

MemberMinistryItem.propTypes = {
  ministry: PropTypes.shape({
    ministry_id: PropTypes.string.isRequired,
    ministry_name: PropTypes.string.isRequired,
    groups: PropTypes.arrayOf(
      PropTypes.shape({
        group_id: PropTypes.string.isRequired,
        group_name: PropTypes.string.isRequired,
        description: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  selectedGroup: PropTypes.string,
  onSelectGroup: PropTypes.func.isRequired,
};

const CoordinatorViewMinistry = () => {
  const [expandedMinistries, setExpandedMinistries] = useState(new Set());
  const [expandedMemberMinistries, setExpandedMemberMinistries] = useState(
    new Set()
  );
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [selectedMinistryId, setSelectedMinistryId] = useState(null);
  const [activeTab, setActiveTab] = useState("announcement");

  const [searchParams, setSearchParams] = useSearchParams();

  const { userData } = useUser();
  const { data: assignedMinistries = [], isLoading } = useAssignedMinistries(
    userData?.id
  );
  const { data: memberGroups = [], isLoading: isLoadingMember } = useUserGroups(
    userData?.id
  );

  const toggleMinistry = (ministryId) => {
    setExpandedMinistries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ministryId)) {
        newSet.delete(ministryId);
      } else {
        newSet.add(ministryId);
      }
      return newSet;
    });
  };

  const toggleMemberMinistry = (ministryId) => {
    setExpandedMemberMinistries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ministryId)) {
        newSet.delete(ministryId);
      } else {
        newSet.add(ministryId);
      }
      return newSet;
    });
  };

  // Handle different formats for coordinator vs member groups
  const selectGroup = (group) => {
    setSelectedGroup(group.id);
    setSelectedGroupDetails(group);
    setSelectedMinistryId(group.ministry_id);
    setSearchParams({ groupId: group.id });
  };

  const selectMemberGroup = (group) => {
    setSelectedGroup(group.group_id);
    setSelectedGroupDetails({
      id: group.group_id,
      name: group.group_name,
      description: group.description,
    });
    setSelectedMinistryId(group.ministry_id);
    setSearchParams({ groupId: group.group_id });
  };

  useEffect(() => {
    const groupIdFromUrl = searchParams.get("groupId");
    if (groupIdFromUrl) {
      // Check in coordinator ministries
      const coordinatorGroup = assignedMinistries
        .flatMap((ministry) => ministry.groups || [])
        .find((group) => group.id === groupIdFromUrl);

      if (coordinatorGroup) {
        setSelectedGroup(coordinatorGroup.id);
        setSelectedGroupDetails(coordinatorGroup);
        setSelectedMinistryId(coordinatorGroup.ministry_id);
        return;
      }

      // Check in member ministries
      for (const ministry of memberGroups) {
        const memberGroup = ministry.groups.find(
          (g) => g.group_id === groupIdFromUrl
        );
        if (memberGroup) {
          setSelectedGroup(memberGroup.group_id);
          setSelectedGroupDetails({
            id: memberGroup.group_id,
            name: memberGroup.group_name,
            description: memberGroup.description,
          });
          setSelectedMinistryId(ministry.ministry_id);
          return;
        }
      }
    }
  }, [assignedMinistries, memberGroups, searchParams]);

  return (
    <div className="flex h-full flex-col text-primary-text lg:flex-row">
      <aside className="w-full overflow-y-auto border-primary-outline/50 lg:max-w-[25rem] lg:border-r">
        <div className="mb-4">
          <div className="px-8 py-4">
            <Label className="text-[20px] font-bold">Your Ministries</Label>
          </div>
        </div>

        <div className="space-y-4 px-4">
          {/* Coordinator Ministries Section */}
          {assignedMinistries.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-2 px-2 text-sm font-semibold">
                Ministries You Coordinate
              </h3>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  assignedMinistries.map((ministry) => (
                    <MinistryItem
                      key={ministry.id}
                      ministry={ministry}
                      isExpanded={expandedMinistries.has(ministry.id)}
                      onToggle={() => toggleMinistry(ministry.id)}
                      selectedGroup={selectedGroup}
                      onSelectGroup={selectGroup}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Member Groups Section */}
          {memberGroups.length > 0 && (
            <div>
              <h3 className="text-muted-foreground mb-2 px-2 text-sm font-semibold">
                {`Groups You're A Member Of`}
              </h3>
              <div className="space-y-3">
                {isLoadingMember ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  memberGroups.map((ministry) => (
                    <MemberMinistryItem
                      key={ministry.ministry_id}
                      ministry={ministry}
                      isExpanded={expandedMemberMinistries.has(
                        ministry.ministry_id
                      )}
                      onToggle={() =>
                        toggleMemberMinistry(ministry.ministry_id)
                      }
                      selectedGroup={selectedGroup}
                      onSelectGroup={selectMemberGroup}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Show message when no ministries */}
          {!isLoading &&
            !isLoadingMember &&
            assignedMinistries.length === 0 &&
            memberGroups.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                No ministries or groups assigned yet.
              </div>
            )}
        </div>
      </aside>

      <main className="hidden w-full lg:block">
        {selectedGroupDetails ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full w-full flex-col overflow-hidden"
          >
            <div className="flex justify-between border-b border-primary-outline/50 px-8 py-4">
              <div>
                <Label className="text-lg font-bold">
                  {selectedGroupDetails.name}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {selectedGroupDetails.description}
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="announcement">Announcement</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              className="no-scrollbar mt-0 h-full w-full overflow-y-auto bg-primary"
              value="announcement"
            >
              <GroupAnnouncements groupId={selectedGroup} />
            </TabsContent>

            <TabsContent
              value="members"
              className="no-scrollbar mt-0 h-full w-full overflow-y-auto bg-primary"
            >
              <GroupMembers
                ministryId={selectedMinistryId}
                groupId={selectedGroup}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-muted-foreground grid h-[90vh] place-content-center">
            Select a group
          </div>
        )}
      </main>

      {/* On mobile, show a message to select a group if none selected */}
      <div className="text-muted-foreground flex-1 py-8 text-center lg:hidden">
        {!selectedGroup && "Select a ministry and group from above"}
      </div>
    </div>
  );
};

export default CoordinatorViewMinistry;
