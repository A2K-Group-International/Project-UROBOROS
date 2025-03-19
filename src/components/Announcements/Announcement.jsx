import { Separator } from "@/components/ui/separator";
import { KebabIcon, GlobeIcon, PersonIcon } from "@/assets/icons/icons";
import PropTypes from "prop-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogDescription,
  // DialogHeader,
  // DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Button } from "../ui/button";
import { useUser } from "@/context/useUser";
import Comments from "../Comments";
import TriggerLikeIcon from "../CommentComponents/TriggerLikeIcon";
import AnnouncementForm from "./AnnouncementForm";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import AutoLinkText from "@/lib/AutoLinkText";

const Announcement = ({ announcement, deleteAnnouncementMutation }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState();
  const { userData } = useUser();
  const location = useLocation();

  if (!userData) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex justify-between">
        <div>
          <h2 className="text-lg font-bold text-accent">
            {announcement.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[0.7rem] font-bold text-accent md:text-sm">
              {location.pathname.startsWith("/ministries") ||
              userData?.role === "admin"
                ? `${announcement?.users?.first_name} ${announcement?.users?.last_name}`
                : userData?.role !== "admin" &&
                  announcement.users.role.toFirstUpperCase()}
            </p>
            <p className="text-[0.7rem] text-accent md:text-sm">
              {new Date(announcement.created_at).toDateTime()}
            </p>
            {/* <img src={GlobeIcon} alt="icon" /> */}
            {announcement.visibility === "public" ? (
              <GlobeIcon className="h-4 w-4 text-accent" />
            ) : (
              <PersonIcon className="h-4 w-4 text-accent" />
            )}
          </div>
        </div>

        {userData?.id === announcement?.user_id && (
          <Popover>
            <PopoverTrigger>
              <KebabIcon className="h-6 w-6 text-accent" />
            </PopoverTrigger>
            <PopoverContent align="center" className="w-32 overflow-hidden p-0">
              <div className="p-2">
                <p className="text-center font-semibold">Actions</p>
              </div>
              <Separator />

              <AnnouncementForm
                announcementId={announcement.id}
                files={announcement.announcement_files}
                title={announcement.title}
                content={announcement.content}
              >
                <Button
                  variant="ghost"
                  className="w-full rounded-none p-3 hover:cursor-pointer"
                >
                  Edit
                </Button>
              </AnnouncementForm>

              <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(isOpen) => {
                  setDeleteDialogOpen(isOpen);
                }}
              >
                <AlertDialogTrigger className="w-full" asChild>
                  <Button
                    variant="ghost"
                    className="w-full rounded-none text-start hover:cursor-pointer"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl text-accent">
                      Delete Announcement?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-accent opacity-80">
                      Are you sure you want to delete this Announcement?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant={"destructive"}
                      onClick={() => {
                        deleteAnnouncementMutation.mutate({
                          announcement_id: announcement.id,
                          filePaths: announcement.announcement_files.map(
                            (file) => file.url
                          ),
                        });
                        setDeleteDialogOpen(false);
                      }}
                      disabled={deleteAnnouncementMutation.isPending}
                    >
                      {deleteAnnouncementMutation.isPending
                        ? "Deleting..."
                        : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <AutoLinkText
        text={announcement.content}
        className="mb-4 block whitespace-pre-wrap break-words text-start leading-5 text-accent"
      />
      <Dialog className="border-none border-transparent">
        <DialogTrigger>
          <div className="flex w-full gap-2">
            {announcement.announcement_files.length > 0 &&
              announcement.announcement_files[0]?.type?.startsWith("image") &&
              announcement.announcement_files.slice(0, 3).map((file, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 border border-primary-outline hover:cursor-pointer",
                    {
                      relative: i === 2,
                    },
                    { "rounded-s-md": i === 0 },
                    { "relative z-20 rounded-e-md bg-black": i === 2 }
                  )}
                >
                  <img
                    className={cn("h-[223px] min-w-0 bg-black object-cover", {
                      "opacity-45": i === 2,
                    })}
                    src={file.url}
                    alt="file"
                  />
                  {i === 2 && announcement.announcement_files.length > 3 && (
                    <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-base font-semibold text-white">
                      +{announcement.announcement_files.length - 3} more
                    </p>
                  )}
                </div>
              ))}
          </div>
        </DialogTrigger>
        {announcement.announcement_files.length > 0 &&
          announcement.announcement_files[0]?.type?.startsWith("video") && (
            <div className="border border-primary-outline">
              <video
                className="h-fit w-full"
                controls
                src={announcement.announcement_files[0]?.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

        {announcement.announcement_files.length > 0 &&
          announcement.announcement_files[0]?.type?.startsWith(
            "application"
          ) && (
            <a
              href={announcement.announcement_files[0]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {`${announcement.announcement_files[0]?.name}.${announcement.announcement_files[0].type.split("/")[1]}`}
            </a>
          )}
        <DialogContent className="flex h-full w-dvw max-w-none items-center justify-center border-0 bg-transparent p-0">
          <DialogHeader className="sr-only">
            <DialogTitle className="sr-only"></DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>
          <Carousel className="w-full max-w-5xl">
            <CarouselContent className="-ml-1 p-0">
              {announcement.announcement_files.map((file, index) => (
                <CarouselItem key={index} className="pl-0">
                  <div className="p-1">
                    <Card className="border-none bg-transparent">
                      <CardContent className="flex aspect-square items-center justify-center bg-transparent bg-contain p-0">
                        <img
                          className="h-[100dvh] w-full object-contain"
                          src={file.url}
                          alt="an image of announcement object-ccover"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="" />
            <CarouselNext />
          </Carousel>
        </DialogContent>
      </Dialog>

      <div className="flex items-end justify-between">
        <div className="relative h-5">
          <TriggerLikeIcon
            className={"absolute w-14 rounded-3xl bg-white p-1"}
            comment_id={announcement.id}
            user_id={userData?.id}
            columnName={"announcement_id"}
          />
        </div>
      </div>
      <Separator className="mb-3 mt-6" />

      <Comments announcement_id={announcement?.id} />
    </div>
  );
};

Announcement.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    file_path: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    visibility: PropTypes.string.isRequired,

    ministry_id: PropTypes.string,
    user_id: PropTypes.string.isRequired,
    announcement_files: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        length: PropTypes.number,
        startsWith: PropTypes.func,
      })
    ),
    users: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      role: PropTypes.string, // Added role prop type
    }).isRequired,
  }).isRequired,
  deleteAnnouncementMutation: PropTypes.shape({
    mutate: PropTypes.func.isRequired,
    isPending: PropTypes.bool.isRequired,
  }).isRequired,
  ministries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ministry_name: PropTypes.string,
    })
  ),
};

export default Announcement;
