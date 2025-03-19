import PropTypes from "prop-types";
import { CloseIcon, Users } from "@/assets/icons/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useMinistry from "@/hooks/useMinistry";
import { Label } from "../ui/label";
import ConfigureMinistry from "./ConfigureMinistry";
import { cn, getInitial } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminCoordinatorView from "./AdminCoordinatorView";
import { Button } from "../ui/button";
import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const MinistryCard = ({
  ministryId,
  title,
  description,
  createdDate,
  image,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const closingRef = useRef(false);

  const [_searchParams, setSearchParams] = useSearchParams();

  const formatDateToUK = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formattedCreatedDate = formatDateToUK(createdDate);

  const { coordinators, membersLoading, error } = useMinistry({ ministryId });

  const maxVisible = 4;
  const visibleAvatars = coordinators?.data?.slice(0, maxVisible);
  const remainingCount = Math.max(coordinators?.data?.length - maxVisible, 0);

  // Function to handle dialog close
  const handleClose = useCallback(() => {
    closingRef.current = true;

    // First update the search params
    setSearchParams((prev) => {
      const updatedParams = new URLSearchParams(prev);
      if (updatedParams.has("groupId")) {
        updatedParams.delete("groupId");
      }
      return updatedParams;
    });

    // Use a small timeout to update the dialog state after the params change has been processed
    setTimeout(() => {
      setIsOpen(false);
      closingRef.current = false;
    }, 0);
  }, [setSearchParams]);

  return (
    <Card className="h-72 max-h-96 max-w-96 rounded-[20px] border px-6 py-5 pb-[26] text-primary-text">
      <CardHeader className="text-pretty p-0">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2">
            <Avatar className="flex h-10 w-10 justify-center rounded-[4px] bg-primary">
              <AvatarImage
                className="h-10 w-10 rounded-[4px] object-cover"
                src={image}
                alt="profile picture"
              />
              <AvatarFallback className="h-10 w-10 rounded-[4px] bg-primary">
                {getInitial(title)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="p-0 text-[16px] font-bold">
                {title}
              </CardTitle>
              <CardDescription className="break-all text-sm font-medium">
                {description}
              </CardDescription>
            </div>
          </div>
          {!membersLoading && coordinators?.data && (
            <ConfigureMinistry //Load the data first before fetching the data
              coordinators={coordinators.data}
              ministryId={ministryId}
              ministryTitle={title}
              ministryImage={image}
              ministryDescription={description}
            />
          )}
        </div>

        <p className="text-sm font-bold text-[#663F30]/60">
          Created:
          <span className="font-medium text-[#663F30]/60">
            {" "}
            {formattedCreatedDate}{" "}
          </span>
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger
            className="w-full text-start"
            onClick={() => setIsOpen(true)}
          >
            <div className="mt-3 flex flex-col gap-y-3 rounded-[15px] bg-primary px-[22px] py-[14px]">
              {membersLoading && <p>Loading members...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!membersLoading &&
                !error &&
                coordinators?.data?.length === 0 && (
                  <p className="text-gray-500">No members</p>
                )}
              <div className="flex items-center gap-x-6">
                <div className="flex flex-wrap items-center justify-center -space-x-4">
                  {visibleAvatars?.map((member, index) => {
                    const initials = getInitial(
                      member.users?.first_name,
                      member.users?.last_name
                    );

                    return (
                      <Avatar
                        key={index}
                        className="h-12 w-12 border-4 border-white"
                      >
                        <AvatarFallback>{initials || "?"}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                </div>
                {remainingCount > 0 && (
                  <div className="bg-muted text-muted-foreground -ml-2 flex h-10 w-10 justify-center rounded-full text-sm font-medium">
                    <div className="inline-flex h-[19px] items-center justify-center gap-1 rounded-[10px] bg-white px-2 py-0.5">
                      <span className="text-primary-text">
                        +{remainingCount}
                      </span>
                      <Users className="text-primary-text" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-semibold">
                  Coordinators Preview:
                </Label>
                <div className="flex w-full">
                  <p
                    className={cn(
                      "overflow-hidden text-ellipsis text-nowrap text-[11px] text-accent/75"
                    )}
                  >
                    {coordinators?.data?.map(
                      (coordinator, i) =>
                        `${coordinator.users.first_name} ${coordinator.users.last_name}${coordinators.data.length > 1 && i < coordinators.data.length - 1 ? ", " : ""}`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent className="flex h-full flex-col px-2 py-6 md:h-[80dvh] md:max-w-[80%]">
            <AlertDialogHeader>
              <AlertDialogTitle className="sr-only">{title}</AlertDialogTitle>
              <AlertDialogDescription className="sr-only">
                {description}
              </AlertDialogDescription>
              <Button
                onClick={handleClose}
                className="absolute right-10 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-primary ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-500 dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[state=open]:bg-neutral-800 dark:data-[state=open]:text-neutral-400"
              >
                <CloseIcon className="h-5 w-5 text-accent opacity-75" />
              </Button>
            </AlertDialogHeader>
            <div>
              <AdminCoordinatorView
                ministryId={ministryId}
                ministryTitle={title}
                ministryImage={image}
                isClosing={closingRef.current}
              />
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

MinistryCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  createdDate: PropTypes.string.isRequired,
  ministryId: PropTypes.string.isRequired,
  image: PropTypes.string,
};

export default MinistryCard;
