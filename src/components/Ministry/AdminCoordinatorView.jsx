import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMediaQuery from "@/hooks/use-media-query";
import { useSearchParams } from "react-router-dom";

import { getOneMinistryGroup } from "@/services/ministryService";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import GroupAnnouncements from "./GroupAnnouncements";
import GroupMembers from "./GroupMembers";
import { Label } from "../ui/label";

const AdminCoordinatorView = ({
  ministryId,
  ministryTitle,
  ministryImage,
  isClosing = false,
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [activeTab, setActiveTab] = useState("announcement");

  const [searchParams, setSearchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");

  // Fetch groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["group-list", ministryId],
    queryFn: () => getOneMinistryGroup(ministryId),
    enabled: !!ministryId,
  });

  // Update the click handler to use searchParams
  const handleClickGroup = useCallback(
    (name, id) => {
      setActiveItem(name);

      // Update URL with groupId
      setSearchParams((prev) => {
        // Create a new URLSearchParams object to avoid mutating the original
        const updatedParams = new URLSearchParams(prev);
        updatedParams.set("groupId", id);
        return updatedParams;
      });
    },
    [setSearchParams]
  );

  useEffect(() => {
    // Skip the auto-setting of groupId if we're in the process of closing
    if (isClosing) return;

    // If we have groups but no groupId in URL, set the first group
    if (groups?.length > 0 && !groupId) {
      const firstGroupId = groups[0]?.id;
      const firstName = groups[0]?.name;

      // Update URL with first group's ID
      setSearchParams((prev) => {
        const updatedParams = new URLSearchParams(prev);
        updatedParams.set("groupId", firstGroupId);
        return updatedParams;
      });

      setActiveItem(firstName);
    }
    // If we have a groupId in URL but no activeItem, find and set the name
    else if (groupId && !activeItem && groups?.length > 0) {
      const selectedGroup = groups.find((group) => group.id === groupId);
      if (selectedGroup) {
        setActiveItem(selectedGroup.name);
      }
    }
  }, [groups, groupId, setSearchParams, activeItem]);

  if (isLoadingGroups) return <Loader2 />;

  return (
    <SidebarProvider>
      <Sidebar
        collapsible={isMobile ? "offcanvas" : "none"}
        className="rounded-2xl"
      >
        <SidebarHeader className="flex flex-row items-center text-primary-text">
          <span>
            <img
              src={ministryImage}
              alt={`${ministryTitle} Picture`}
              className="w-20"
            />
          </span>
          <div>
            <h2 className="text-xl font-bold">{ministryTitle}</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <p>List of Groups</p>
                {groups.map((group) => (
                  <SidebarMenuItem key={group.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={group.name === activeItem}
                      onClick={() => handleClickGroup(group.name, group.id)}
                    >
                      <button>
                        <span>{group.name}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="no-scrollbar h-[45rem] flex-1 overflow-y-scroll md:h-[40rem]">
        <div className="flex items-center justify-start px-6">
          <SidebarTrigger className="mr-4 md:hidden" />
        </div>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex w-full flex-col overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center rounded-t-2xl border-b border-primary-outline bg-primary px-8 py-4 md:flex-row md:justify-between">
            <div>
              <Label className="text-lg font-bold">
                {groups.find((group) => group.id === groupId)?.name ||
                  "No group selected"}
              </Label>
              <p className="text-muted-foreground text-sm">
                {groups.find((group) => group.id === groupId)?.description ||
                  ""}
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
            <div className="h-dvh">
              <GroupAnnouncements ministryId={ministryId} groupId={groupId} />
            </div>
          </TabsContent>

          <TabsContent
            value="members"
            className="no-scrollbar mt-0 h-full w-full overflow-y-auto bg-primary"
          >
            <GroupMembers ministryId={ministryId} groupId={groupId} />
          </TabsContent>
        </Tabs>
      </main>
    </SidebarProvider>
  );
};

AdminCoordinatorView.propTypes = {
  ministryId: PropTypes.string.isRequired,
  ministryTitle: PropTypes.string.isRequired,
  ministryImage: PropTypes.string.isRequired,
  isClosing: PropTypes.bool.isRequired,
};

export default AdminCoordinatorView;
