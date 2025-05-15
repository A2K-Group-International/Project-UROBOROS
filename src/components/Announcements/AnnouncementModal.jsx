import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import Announcement from "./Announcement";
import { useQuery } from "@tanstack/react-query";
import {
  fetchSingleAnnouncement,
  getAnnouncementByComment,
} from "@/services/AnnouncementsService";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

const AnnouncementModal = () => {
  const [params, setParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Get the announcement ID from URL
  const announcementId = params.get("announcementId");
  const commentId = params.get("commentId");

  // Fetch announcement data only when ID exists in URL
  const { data, isLoading, error } = useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: () => fetchSingleAnnouncement(announcementId),
    enabled: !!announcementId,
  });

  const {
    data: announcementDataByComment,
    isLoading: isLoadingByComment,
    error: announcementByIdError,
  } = useQuery({
    queryKey: ["announcement", commentId],
    queryFn: () => getAnnouncementByComment(commentId),
    enabled: !!commentId,
  });

  if (announcementByIdError) {
    console.error(
      "Error fetching announcement by comment:",
      announcementByIdError
    );
  }

  // Control modal open state based on URL parameter
  useEffect(() => {
    if (announcementId || commentId) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [announcementId, commentId]);

  // Handle dialog close - remove the URL parameter
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      // Remove all parameters when closing
      setParams({}, { replace: true });
    }
  };

  // Don't render anything if neither ID exists in URL
  if (!announcementId && !commentId) {
    return null;
  }
  // Show loading state if either query is loading
  if (isLoading || (isLoadingByComment && commentId)) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="h-fit w-full max-w-3xl">
          <div>
            <div className="mb-3 flex justify-between">
              <div>
                <Skeleton className="h-6 w-48" />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>

            <Skeleton className="mb-4 h-20 w-full" />
            <Skeleton className="mb-6 h-48 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error if the primary query failed
  if (error && announcementId) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <p className="text-red-500">
            Failed to load announcement: {error.message}
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="no-scrollbar h-fit max-h-[90%] w-full max-w-3xl overflow-scroll">
        {data || announcementDataByComment ? (
          <Announcement
            announcement={data ?? announcementDataByComment.announcement}
            isModal={true}
          />
        ) : (
          <div className="flex items-center justify-center">
            <p>No announcement found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

AnnouncementModal.displayName = "AnnouncementModal";

export default AnnouncementModal;
