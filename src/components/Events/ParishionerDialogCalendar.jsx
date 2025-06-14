import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Calendar from "../Calendar";
import PropTypes from "prop-types";
import { Icon } from "@iconify/react";

const ParishionerDialogCalendar = ({ events }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Icon icon="mingcute:calendar-line" className="mr-1" width={20} />
          Calendar
          
        </Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar max-h-dvh max-w-7xl overflow-y-scroll ">
        <Calendar events={events} />
      </DialogContent>
    </Dialog>
  );
};

ParishionerDialogCalendar.propTypes = {
  events: PropTypes.array,
};
export default ParishionerDialogCalendar;
