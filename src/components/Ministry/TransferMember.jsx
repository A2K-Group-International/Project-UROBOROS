import { useState } from "react";
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
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Icon } from "@iconify/react";
import { Label } from "../ui/label";
import { useQuery } from "@tanstack/react-query";
import { transferMembersFetchGroups } from "@/services/groupServices";
import { Loader2 } from "lucide-react";
import useGroups from "@/hooks/useGroups";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TransferMember = ({
  userId,
  groupId,
  firstName,
  lastName,
  assignedMinistry,
}) => {
  const [selectedGroup, setSelectGroup] = useState({ name: null, id: null });
  const { transferUserToGroupMutation } = useGroups({ groupId });

  const handleGroupSelect = (group) => {
    setSelectGroup({ name: group.name, id: group.id });
  };

  const handleTransfer = () => {
    if (selectedGroup.id) {
      transferUserToGroupMutation.mutate({
        userId,
        currentGroupId: groupId,
        newGroupId: selectedGroup.id,
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="hover:text-primary-text">
          <div className="flex items-center gap-x-2">
            <Icon icon="mingcute:transfer-3-line" width={24} />
            <p className="hidden md:block">Transfer</p>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-x-2">
            <div>
              <Avatar>
                {/* <AvatarImage src={member.avatar_url} /> */}
                <AvatarFallback className="bg-primary-outline/60 text-primary-text">
                  {firstName?.charAt(0)}
                  {lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <AlertDialogTitle>
                Transfer {`${firstName} ${lastName}`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Move this user to a different ministry group.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogBody className="no-scrollbar max-h-[37rem] overflow-y-scroll">
          <div>
            <Label>Transfer to</Label>
          </div>
          <Accordion type="single" collapsible>
            {assignedMinistry?.map((ministry) => (
              <AccordionItem key={ministry.id} value={ministry.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-x-2">
                    <Avatar>
                      <AvatarImage src={ministry.image_url} />
                      <AvatarFallback className="bg-primary-outline/60 text-primary-text">
                        {ministry.ministry_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label className="font-bold">
                        {ministry.ministry_name}
                      </Label>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <MinistrySubMenu
                    ministry={ministry}
                    currentGroupId={groupId}
                    onSelectGroup={handleGroupSelect}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={
              !selectedGroup.id || transferUserToGroupMutation.isPending
            }
            onClick={handleTransfer}
          >
            {transferUserToGroupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

TransferMember.propTypes = {
  userId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
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

// Ministry submenu
const MinistrySubMenu = ({ ministry, currentGroupId, onSelectGroup }) => {
  const [selectedValue, setSelectedValue] = useState("");
  // Fetch groups for this specific ministry
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["transferGroups", ministry.id, currentGroupId],
    queryFn: () => transferMembersFetchGroups(ministry.id, currentGroupId),
    enabled: !!ministry.id && !!currentGroupId,
  });

  const handleValueChange = (value) => {
    setSelectedValue(value);
    const selectedGroup = groups.find((group) => group.id === value);
    if (selectedGroup) {
      onSelectGroup(selectedGroup);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span className="text-sm">Loading groups...</span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-muted-foreground px-2 py-4 text-center text-sm">
        No other groups available in this ministry
      </div>
    );
  }

  return (
    <RadioGroup
      value={selectedValue}
      onValueChange={handleValueChange}
      className="space-y-2"
    >
      {groups.map((group) => (
        <div key={group.id} className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-x-2">
              <Avatar>
                <AvatarImage src={group.image_url} />
                <AvatarFallback className="bg-primary-outline/60 text-primary-text">
                  {group.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Label htmlFor={`group-${group.id}`} className="font-medium">
                {group.name}
              </Label>
            </div>
          </div>
          <RadioGroupItem value={group.id} id={`group-${group.id}`} />
        </div>
      ))}
    </RadioGroup>
  );
};

MinistrySubMenu.propTypes = {
  ministry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    ministry_name: PropTypes.string.isRequired,
  }).isRequired,
  currentGroupId: PropTypes.string.isRequired,
  onSelectGroup: PropTypes.func.isRequired,
};

export default TransferMember;
