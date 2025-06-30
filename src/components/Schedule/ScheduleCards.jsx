import { EventIcon } from "@/assets/icons/icons";
import { ROLES } from "@/constants/roles";
import { cn, formatEventDate, formatEventTimeCompact } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import ScheduleDetails from "./ScheduleDetails";
import { memo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import NewEditEvent from "./NewEditEvent";
import { useUser } from "@/context/useUser";

const ScheduleCards = ({ event, onEventClick, urlPrms, filter }) => {
  const { userData } = useUser();
  const role = userData?.role;
  const [disableEdit, setDisabledEdit] = useState(false);

  useEffect(() => {
    if (event.event_date) {
      const eventDate = new Date(`${event.event_date}`);
      const sevenDaysAhead = new Date(
        eventDate.getTime() + 7 * 24 * 60 * 60 * 1000
      );
      const currentDate = new Date();
      if (sevenDaysAhead < currentDate) {
        setDisabledEdit(true);
      } else {
        setDisabledEdit(false);
      }
    }
  }, [event.event_date]);

  return (
    <div className="relative">
      <div
        className={cn(
          "hidden cursor-pointer items-start justify-between gap-3 rounded-[10px] bg-primary/50 px-5 py-4 xl:flex",
          event.id === urlPrms.get("event") && "border border-primary-outline"
        )}
        onClick={() => onEventClick(event.id)}
      >
        <div className="flex gap-3">
          <EventIcon className="text-2xl text-accent" />
          <div>
            <p className="mb-[6px] text-base font-bold leading-none text-accent">
              {event.requires_attendance
                ? `${event?.event_name}, ${formatEventTimeCompact(event?.event_time)}`
                : event.event_name}
            </p>
            <p className="text-sm text-primary-text">{event.description}</p>
            <p className="text-sm leading-tight text-primary-text">
              {event.event_category} - {event.event_visibility}
            </p>
            {(role === ROLES[4] || role === ROLES[0]) && (
              <p className="text-sm text-primary-text">
                {`Created by: ${event.creator_id.first_name} ${event.creator_id.last_name}`}
              </p>
            )}
            <p className="text-md font-bold leading-none text-primary-text">
              <span className="font-semibold">Date: </span>
              {formatEventDate(event.event_date)}
            </p>
          </div>
        </div>
        {!disableEdit && (role === ROLES[0] || role === ROLES[4]) && (
          <NewEditEvent
            initialEventData={{ ...event }}
            queryKey={[
              "schedules",
              filter,
              urlPrms.get("query")?.toString() || "",
            ]}
          />
          // <Dialog
          //   open={editDialogOpenIndex === `${i}-${j}`}
          //   onOpenChange={(isOpen) =>
          //     setEditDialogOpenIndex(isOpen ? `${i}-${j}` : null)
          //   }
          // >
          //   <DialogTrigger asChild>
          //     <Button
          //       variant="ghost"
          //       className="-mt-3 p-0 font-semibold text-accent hover:underline"
          //     >
          //       Edit
          //     </Button>
          //   </DialogTrigger>

          //   <DialogContent>
          //     <DialogHeader>
          //       <DialogTitle>Edit Events</DialogTitle>
          //       <DialogDescription>
          //         Schedule an upcoming events.
          //       </DialogDescription>
          //     </DialogHeader>
          //     <CreateEvent
          //       id="update-event"
          //       eventData={{ ...event }}
          //       setDialogOpen={(isOpen) => {
          //         setEditDialogOpenIndex(isOpen ? `${i}-${j}` : null);
          //       }}
          //       queryKey={[
          //         "schedules",
          //         filter,
          //         urlPrms.get("query")?.toString() || "",
          //       ]}
          //     />
          //     {/* Dialog Footer */}
          //     <DialogFooter>
          //       <div className="flex justify-end gap-2">
          //         <DialogClose asChild>
          //           <Button variant="outline">Cancel</Button>
          //         </DialogClose>

          //         <Button type="submit" form="update-event">
          //           Update
          //         </Button>
          //       </div>
          //     </DialogFooter>
          //   </DialogContent>
          // </Dialog>
        )}
      </div>

      <div
        className={cn(
          "lg flex w-full cursor-pointer items-start gap-3 rounded-[10px] bg-primary/50 px-5 py-4 xl:hidden",
          event.id === urlPrms.get("event") && "border border-primary-outline"
        )}
        onClick={() => onEventClick(event.id)}
      >
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex flex-1 gap-3">
              <EventIcon className="text-2xl text-accent" />
              <div>
                <p className="mb-[6px] text-base font-bold leading-none text-accent">
                  {event.requires_attendance
                    ? `${event?.event_name}, ${formatEventTimeCompact(event?.event_time)}`
                    : event.event_name}
                </p>
                <p className="text-sm text-primary-text">{event.description}</p>
                <p className="text-sm leading-tight text-primary-text">
                  {event.event_category} - {event.event_visibility}
                </p>
                {role === ROLES[4] && (
                  <p className="text-sm text-primary-text">{`Created by: ${event.creator_id.first_name} ${event.creator_id.last_name}`}</p>
                )}
                <p className="text-md font-bold leading-none text-primary-text">
                  <span className="font-semibold">Date: </span>
                  {formatEventDate(event.event_date)}
                </p>
              </div>
            </div>
          </SheetTrigger>
          <SheetContent className="w-full p-0 md:w-full xl:hidden">
            {urlPrms.get("event") && (
              <ScheduleDetails
                queryKey={[
                  "schedules",
                  filter,
                  urlPrms.get("query")?.toString() || "",
                ]}
              />
            )}
          </SheetContent>
        </Sheet>
        <NewEditEvent
          initialEventData={{ ...event }}
          queryKey={[
            "schedules",
            filter,
            urlPrms.get("query")?.toString() || "",
          ]}
        />
        {/* <Dialog
          open={sheetEditDialogOpenIndex === `${i}-${j}`}
          onOpenChange={(isOpen) =>
            setSheetEditDialogOpenIndex(isOpen ? `${i}-${j}` : null)
          }
        >
          {!disableEdit &&
            (role === ROLES[0] || role === ROLES[4]) && (
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="-mt-3 p-0 font-semibold text-accent hover:underline"
                >
                  Edit
                </Button>
              </DialogTrigger>
            )}
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Events</DialogTitle>
              <DialogDescription>Schedule an upcoming event.</DialogDescription>
            </DialogHeader>
            <CreateEvent
              id="update-event"
              eventData={{ ...event }}
              setDialogOpen={(isOpen) => {
                setSheetEditDialogOpenIndex(isOpen ? `${i}-${j}` : null);
              }}
              queryKey={[
                "schedules",
                filter,
                urlPrms.get("query")?.toString() || "",
              ]}
            />

            <DialogFooter>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button type="submit" form="update-event">
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  );
};
ScheduleCards.propTypes = {
  editDialogOpenIndex: PropTypes.bool,
  setEditDialogOpenIndex: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    event_name: PropTypes.string.isRequired,
    event_date: PropTypes.string.isRequired,
    event_time: PropTypes.string,
    event_category: PropTypes.string,
    event_visibility: PropTypes.string,
    requires_attendance: PropTypes.bool,
    creator_id: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    }),
    description: PropTypes.string,
  }).isRequired,
  onEventClick: PropTypes.func.isRequired,
  urlPrms: PropTypes.object.isRequired,
  filter: PropTypes.string.isRequired,
};

export default memo(ScheduleCards);
