import PropTypes from "prop-types";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import AddCoordinators from "./AddCoordinators";
import RemoveCoordinator from "./RemoveCoordinator";
import useMinistry from "@/hooks/useMinistry";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import useGroups from "@/hooks/useGroups";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitial } from "@/lib/utils";
import CreateMinistry from "./CreateMinistry";
import { Icon } from "@iconify/react";

const ConfigureMinistry = ({
  coordinators,
  ministryId,
  ministryTitle,
  ministryDescription,
  ministryImage,
}) => {
  // Separate editing states for title and description

  const { deleteMutation } = useMinistry({
    ministryId,
  });

  // Fetch groups
  const {
    groups: { data: groups = [] },
    isLoading: isLoadingGroups,
  } = useGroups({
    ministryId,
  });

  const handleDeleteMinistry = () => {
    deleteMutation.mutate(ministryId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Icon icon="humbleicons:dots-horizontal" />
      </AlertDialogTrigger>
      <AlertDialogContent className="no-scrollbar flex h-auto max-h-[80vh] max-w-[860px] flex-col overflow-hidden border-none">
        <AlertDialogHeader className="flex-shrink-0 flex-row items-center justify-between gap-1">
          <div className="flex">
            <Avatar className="flex h-10 w-10 justify-center rounded-[4px] bg-primary">
              <AvatarImage
                className="h-10 w-10 rounded-[4px] object-cover"
                src={ministryImage}
                alt="profile picture"
              />
              <AvatarFallback className="h-10 w-10 rounded-[4px] bg-primary">
                {getInitial(ministryTitle)}
              </AvatarFallback>
            </Avatar>
            <div>
              <AlertDialogTitle className="text-2xl font-bold text-accent">
                {ministryTitle}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {ministryDescription}
              </AlertDialogDescription>
            </div>
          </div>
          <CreateMinistry
            ministryId={ministryId}
            ministryTitle={ministryTitle}
            ministryDescription={ministryDescription}
            ministryImage={ministryImage}
          >
            <Button className="bg-primary-outline/35 text-accent">Edit</Button>
          </CreateMinistry>
        </AlertDialogHeader>
        <div className="no-scrollbar overflow-y-scroll">
          <AlertDialogBody className="flex flex-col gap-6 md:flex-row">
            {/* Coordinators Section */}
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between text-[#663F30]/70">
                <Label className="font-bold text-accent">Coordinators</Label>
                <AddCoordinators ministryId={ministryId} />
              </div>
              <div className="max-h-[calc(100%-40px)] space-y-2 overflow-y-auto">
                {coordinators?.map((coordinator) => (
                  <div
                    key={coordinator.id}
                    className="flex items-center justify-between rounded-xl bg-primary-outline/15 p-4"
                  >
                    <Label className="font-semibold">
                      {coordinator.users.first_name}{" "}
                      {coordinator.users.last_name}
                    </Label>
                    <RemoveCoordinator
                      ministryId={ministryId}
                      coordinator_id={coordinator.id}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Groups Section */}
            <div className="flex-1">
              <Label className="font-bold text-accent">Groups</Label>
              {isLoadingGroups && (
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              )}

              <div className="no-scrollbar mt-6 max-h-[calc(100%-40px)] space-y-2 overflow-y-auto">
                {isLoadingGroups ? (
                  <div className="flex h-16 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : groups.length < 1 ? (
                  <div className="flex items-center justify-center py-2">
                    <p className="text-muted-foreground text-sm">
                      No groups created yet.
                    </p>
                  </div>
                ) : (
                  groups?.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-xl bg-primary-outline/15 p-4"
                    >
                      <Label className="font-semibold">{group.name}</Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AlertDialogBody>
          <AlertDialogFooter className="flex-shrink-0">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1">
                  Delete Ministry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="no-scrollbar border-none">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-bold text-accent">
                    Delete Ministry
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this ministry? This action
                    cannot be undone.
                  </AlertDialogDescription>

                  <Separator className="my-4" />

                  <AlertDialogFooter className="flex-shrink-0">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      onClick={handleDeleteMinistry}
                      variant="destructive"
                      className="flex-1"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Ministry"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ConfigureMinistry.propTypes = {
  ministryTitle: PropTypes.string.isRequired,
  ministryDescription: PropTypes.string,
  ministryId: PropTypes.string.isRequired,
  ministryImage: PropTypes.string,
  coordinators: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      users: PropTypes.shape({
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
};

export default ConfigureMinistry;
