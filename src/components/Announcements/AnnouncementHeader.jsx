import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitial } from "@/lib/utils";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { Icon } from "@iconify/react";
import { Button } from "../ui/button";
import AnnouncementForm from "./AnnouncementForm";

const AnnouncementHeader = ({ image, first_name, subgroupId, groupId }) => {
  return (
    <>
      <div className="flex h-[84px] w-full gap-2 rounded-[10px] border-primary-outline bg-white px-8 py-6">
        <Avatar className="h-8 w-8">
          <AvatarImage src={image ?? ""} alt="profile picture" />
          <AvatarFallback>{getInitial(first_name)}</AvatarFallback>
        </Avatar>

        <AnnouncementForm subgroupId={subgroupId} groupId={groupId}>
          <div className="flex w-full gap-2">
            <Input placeholder="Announce something publicly." />
            <Button className="h-9 w-14 rounded-[18px] bg-primary">
              <Icon className="text-accent" icon="mingcute:photo-album-fill" />
            </Button>
          </div>
        </AnnouncementForm>
      </div>
      <div className="flex w-full items-center justify-center overflow-hidden py-5">
        <Separator />
        <p className="px-2 text-[#DCC1B4]">Announcements</p>
        <Separator />
      </div>
    </>
  );
};

AnnouncementHeader.propTypes = {
  image: PropTypes.string,
  first_name: PropTypes.string.isRequired,
  subgroupId: PropTypes.string,
  groupId: PropTypes.string,
};

export default AnnouncementHeader;
