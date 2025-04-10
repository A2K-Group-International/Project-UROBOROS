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
import CartoonizedChurch from "@/assets/images/CartoonizedChurch.png";

import ConfigureSubgroup from "./ConfigureSubgroup";
import { fetchSubgroup, fetchSubgroups } from "@/services/subgroupServices";

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
            ministryImage={ministry.image_url}
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
  // Track expanded groups that show subgroups
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // If groups aren't passed, fetch them
  const groupsQuery = useGroups({ ministryId });
  const groupsData = groups || groupsQuery.groups?.data || [];
  const loading = isLoading || groupsQuery.isLoading;

  const toggleGroup = (groupId, e) => {
    // Stop propagation to prevent triggering group selection
    e.stopPropagation();

    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

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
              <div className="mb-1 flex items-center justify-between">
                {/* Group header with expand toggle for subgroups */}
                <div
                  className={`flex w-full cursor-pointer items-center rounded-lg px-4 py-2 text-left ${
                    selectedGroup === group.id
                      ? "bg-primary font-bold text-primary-text"
                      : "hover:bg-primary/5"
                  }`}
                >
                  <div
                    className="mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(group.id, e);
                    }}
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="h-4 w-4 text-primary-text" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-primary-text" />
                    )}
                  </div>

                  <Sheet>
                    <SheetTrigger className="flex w-full items-center gap-x-2">
                      <Avatar>
                        <AvatarImage
                          className="h-10 w-10 rounded-[4px] object-cover"
                          src={group.image_url}
                          alt="profile picture"
                        />
                        <AvatarFallback>
                          {group.name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p>{group.name}</p>
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

                  <div className="ml-auto">
                    <ConfigureSubgroup groupId={group.id} />
                  </div>
                </div>
              </div>

              {/* Mobile Subgroups List */}
              {expandedGroups.has(group.id) && (
                <MobileSubgroupsList
                  groupId={group.id}
                  ministryId={ministryId}
                />
              )}
            </div>

            {/* Desktop View - Updated to support expanding for subgroups */}
            <div className="hidden lg:block">
              <div
                className={`cursor-pointer rounded-lg px-4 py-2 ${
                  selectedGroup === group.id
                    ? "bg-primary"
                    : "hover:bg-primary/5"
                }`}
              >
                <div
                  className="flex items-center justify-between gap-x-2"
                  onClick={() => onSelectGroup(group)}
                >
                  <div className="flex items-center gap-x-2">
                    <div
                      className="mr-1 flex h-4 w-4 items-center justify-center"
                      onClick={(e) => toggleGroup(group.id, e)}
                    >
                      {expandedGroups.has(group.id) ? (
                        <ChevronDown className="h-4 w-4 text-primary-text" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-primary-text" />
                      )}
                    </div>
                    <Avatar>
                      <AvatarImage
                        className="h-10 w-10 rounded-[4px] object-cover"
                        src={group.image_url}
                        alt="profile picture"
                      />
                      <AvatarFallback>
                        {group.name?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p
                      className={
                        selectedGroup === group.id
                          ? "font-bold text-primary-text"
                          : ""
                      }
                    >
                      {group.name}
                    </p>
                  </div>
                  <ConfigureSubgroup groupId={group.id} />
                </div>
              </div>

              {/* Subgroups section (only visible when group is expanded) */}
              {expandedGroups.has(group.id) && (
                <SubgroupsList groupId={group.id} />
              )}
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

const SubgroupsList = ({ groupId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSubgroup = searchParams.get("subgroupId");

  const { data: subgroups = [], isLoading } = useQuery({
    queryKey: ["subgroups", groupId],
    queryFn: () => fetchSubgroups(groupId),
    enabled: !!groupId,
  });

  const handleSelectSubgroup = (subgroup) => {
    // Replace groupId with subgroupId in URL when subgroup is selected
    setSearchParams({
      subgroupId: subgroup.id,
    });
  };

  if (isLoading) {
    return (
      <div className="ml-10 mt-1 flex justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (subgroups.length === 0) {
    return (
      <div className="text-muted-foreground ml-10 mt-1 py-2 text-sm">
        No subgroups created yet.
      </div>
    );
  }

  return (
    <div className="ml-10 mt-1 space-y-1">
      {subgroups.map((subgroup) => (
        <div
          key={subgroup.id}
          className={`flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 ${
            selectedSubgroup === subgroup.id
              ? "bg-primary text-primary-text"
              : "hover:bg-primary/5"
          }`}
          onClick={() => handleSelectSubgroup(subgroup)}
        >
          <div className="flex items-center gap-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                className="h-8 w-8 rounded-[4px] object-cover"
                src={subgroup.image_url}
                alt="subgroup picture"
              />
              <AvatarFallback className="h-8 w-8">
                {subgroup.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p
              className={`text-sm ${selectedSubgroup === subgroup.id ? "font-bold" : ""}`}
            >
              {subgroup.name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

SubgroupsList.propTypes = {
  groupId: PropTypes.string.isRequired,
};

const MobileSubgroupsList = ({ groupId, ministryId }) => {
  const { data: subgroups = [], isLoading } = useQuery({
    queryKey: ["subgroups", groupId],
    queryFn: () => fetchSubgroups(groupId),
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="ml-8 mt-1 flex justify-center py-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      </div>
    );
  }

  if (subgroups.length === 0) {
    return (
      <div className="text-muted-foreground ml-8 mt-1 py-2 text-sm">
        No subgroups created yet.
      </div>
    );
  }

  return (
    <div className="ml-8 mt-1 space-y-1">
      {subgroups.map((subgroup) => (
        <Sheet key={subgroup.id}>
          <SheetTrigger className="w-full cursor-pointer rounded-lg px-4 py-2 text-left hover:bg-primary/5">
            <div className="flex items-center gap-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  className="h-8 w-8 rounded-[4px] object-cover"
                  src={subgroup.image_url}
                  alt="subgroup picture"
                />
                <AvatarFallback className="h-8 w-8">
                  {subgroup.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm">{subgroup.name}</p>
            </div>
          </SheetTrigger>
          <SheetContent className="w-full">
            <SheetHeader>
              <SheetTitle>{subgroup.name}</SheetTitle>
              <SheetDescription>{subgroup.description}</SheetDescription>
            </SheetHeader>

            {/* Mobile Tabs for Subgroup - Fix the GroupMembers component props */}
            <Tabs defaultValue="announcement" className="h-full">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="announcement">Announcements</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>
              <TabsContent
                value="announcement"
                className="no-scrollbar h-[calc(100%-60px)] overflow-y-auto"
              >
                <GroupAnnouncements subgroupId={subgroup.id} />
              </TabsContent>
              <TabsContent
                value="members"
                className="no-scrollbar h-[calc(100%-60px)] overflow-y-auto"
              >
                <GroupMembers
                  ministryId={ministryId}
                  groupId={groupId}
                  subgroupId={subgroup.id}
                />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
};

MobileSubgroupsList.propTypes = {
  groupId: PropTypes.string.isRequired,
  ministryId: PropTypes.string.isRequired,
};

// Define MemberMinistryItem component for member groups
const MemberMinistryItem = ({
  ministry,
  isExpanded,
  onToggle,
  selectedGroup,
  onSelectGroup,
}) => {
  // Add state for tracking expanded groups within this ministry item
  const [expandedGroups, setExpandedGroups] = useState(new Set());

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
            <AvatarImage
              className="h-10 w-10 rounded-[4px] object-cover"
              src={ministry.image_url}
              alt="profile picture"
            />
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
                  <div
                    className="mb-1 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add proper handling for expandedGroups state
                      const isExpanded = expandedGroups.has(group.group_id);
                      setExpandedGroups((prev) => {
                        const newSet = new Set(prev);
                        if (isExpanded) {
                          newSet.delete(group.group_id);
                        } else {
                          newSet.add(group.group_id);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <div className="mr-2">
                      {expandedGroups.has(group.group_id) ? (
                        <ChevronDown className="h-4 w-4 text-primary-text" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-primary-text" />
                      )}
                    </div>

                    <Sheet>
                      <SheetTrigger
                        className={`w-full cursor-pointer rounded-lg px-4 py-2 text-left ${
                          selectedGroup === group.group_id
                            ? "bg-primary font-bold text-primary-text"
                            : "hover:bg-primary/5"
                        }`}
                      >
                        <div className="flex items-center gap-x-2">
                          <Avatar>
                            <AvatarImage
                              className="h-10 w-10 rounded-[4px] object-cover"
                              src={group.image_url}
                              alt="profile picture"
                            />
                            <AvatarFallback>
                              {group.group_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p>{group.group_name}</p>
                        </div>
                      </SheetTrigger>
                      {/* Rest of Sheet content remains the same */}
                    </Sheet>
                  </div>

                  {/* Mobile Subgroups List for member groups */}
                  {expandedGroups.has(group.group_id) && (
                    <MobileSubgroupsList
                      groupId={group.group_id}
                      ministryId={ministry.ministry_id}
                    />
                  )}
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
                    <div className="flex items-center gap-x-2">
                      <Avatar>
                        <AvatarImage
                          className="h-10 w-10 rounded-[4px] object-cover"
                          src={group.image_url}
                          alt="profile picture"
                        />
                        <AvatarFallback>
                          {group.group_name?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <p>{group.group_name}</p>
                    </div>
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
    image_url: PropTypes.string,
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
  const [selectedSubgroup, setSelectedSubgroup] = useState(null);
  const [selectedSubgroupDetails, setSelectedSubgroupDetails] = useState(null);
  const [viewingSubgroup, setViewingSubgroup] = useState(false);

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
    const subgroupIdFromUrl = searchParams.get("subgroupId");

    // We have a subgroup ID - prioritize subgroup view
    if (subgroupIdFromUrl) {
      // Only update subgroup-related state if we're not already viewing this subgroup
      if (selectedSubgroup !== subgroupIdFromUrl) {
        setViewingSubgroup(true);
        setSelectedSubgroup(subgroupIdFromUrl);

        // Fetch subgroup details
        const fetchSubgroupDetails = async () => {
          try {
            const subgroupDetails = await fetchSubgroup(subgroupIdFromUrl);

            if (subgroupDetails) {
              setSelectedSubgroupDetails(subgroupDetails);
              // Clear group selection when viewing a subgroup
              setSelectedGroup(null);
              setSelectedGroupDetails(null);
            }
          } catch (error) {
            console.error("Error fetching subgroup details", error);
          }
        };

        fetchSubgroupDetails();
      }
    }
    //  No subgroup ID but we have a group ID
    else if (groupIdFromUrl) {
      // Only clear subgroup state if we were previously viewing a subgroup
      if (viewingSubgroup) {
        setViewingSubgroup(false);
        setSelectedSubgroup(null);
        setSelectedSubgroupDetails(null);
      }

      // Check if we're already viewing this group to prevent unnecessary updates
      if (selectedGroup !== groupIdFromUrl) {
        // First check coordinator ministries
        const coordinatorGroup = assignedMinistries
          .flatMap((ministry) => ministry.groups || [])
          .find((group) => group.id === groupIdFromUrl);

        if (coordinatorGroup) {
          setSelectedGroup(coordinatorGroup.id);
          setSelectedGroupDetails(coordinatorGroup);
          setSelectedMinistryId(coordinatorGroup.ministry_id);
          return;
        }

        // Then check member ministries
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
              image_url: memberGroup.image_url,
            });
            setSelectedMinistryId(ministry.ministry_id);
            return;
          }
        }
      }
    }
    //  No subgroup or group ID in URL - clear all selections
    else {
      setSelectedGroup(null);
      setSelectedGroupDetails(null);
      setSelectedSubgroup(null);
      setSelectedSubgroupDetails(null);
      setViewingSubgroup(false);
    }
  }, [
    assignedMinistries,
    memberGroups,
    searchParams,
    selectedGroup,
    selectedSubgroup,
    viewingSubgroup,
  ]);

  return (
    <div className="flex h-full flex-col text-primary-text lg:flex-row">
      <aside className="no-scrollbar w-full overflow-y-auto border-primary-outline/50 lg:max-w-[25rem] lg:border-r">
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
              <div className="py-8 text-center">
                <p>No ministry or group assigned yet.</p>
              </div>
            )}
        </div>
      </aside>

      <main className="hidden w-full lg:block">
        {viewingSubgroup && selectedSubgroupDetails ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full w-full flex-col overflow-hidden"
          >
            <div className="flex justify-between border-b border-primary-outline/50 px-8 py-4">
              <div>
                <div className="flex items-center gap-x-2">
                  <Avatar>
                    <AvatarImage
                      className="h-10 w-10 rounded-[4px] object-cover"
                      src={selectedSubgroupDetails.image_url}
                      alt="subgroup picture"
                    />
                    <AvatarFallback>
                      {selectedSubgroupDetails.name
                        ?.substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Label className="text-lg font-bold">
                    {selectedSubgroupDetails.name}
                  </Label>
                </div>
                <p className="text-muted-foreground text-sm">
                  {selectedSubgroupDetails.description}
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
              <GroupAnnouncements subgroupId={selectedSubgroup} />
            </TabsContent>

            <TabsContent
              value="members"
              className="no-scrollbar mt-0 h-full w-full overflow-y-auto bg-primary"
            >
              <GroupMembers
                ministryId={selectedMinistryId}
                groupId={selectedSubgroupDetails.group_id}
                subgroupId={selectedSubgroup}
              />
            </TabsContent>
          </Tabs>
        ) : selectedGroupDetails ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex h-full w-full flex-col overflow-hidden"
          >
            <div className="flex justify-between border-b border-primary-outline/50 px-8 py-4">
              <div>
                <div className="flex items-center gap-x-2">
                  <Avatar>
                    <AvatarImage
                      className="h-10 w-10 rounded-[4px] object-cover"
                      src={selectedGroupDetails.image_url}
                      alt="profile picture"
                    />
                    <AvatarFallback>
                      {selectedGroupDetails.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Label className="text-lg font-bold">
                    {selectedGroupDetails.name}
                  </Label>
                </div>
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
          <div className="grid h-[90dvh] place-content-center gap-y-2">
            <img src={CartoonizedChurch} alt="Cartoonized Church" />
            <p className="text-[20px] text-accent/30">OPEN A MINISTRY GROUP</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default CoordinatorViewMinistry;
