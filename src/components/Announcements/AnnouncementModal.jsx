import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import Announcement from "./Announcement";
import { useQuery } from "@tanstack/react-query";
import { fetchSingleAnnouncement } from "@/services/AnnouncementsService";
import { useSearchParams } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

// This is now a standalone modal that responds only to URL parameters
const AnnouncementModal = () => {
  const [params, setParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Get the announcement ID from URL
  const announcementId = params.get("announcementId");

  // Fetch announcement data only when ID exists in URL
  const { data, isLoading, error } = useQuery({
    queryKey: ["announcement", announcementId],
    queryFn: () => fetchSingleAnnouncement(announcementId),
    enabled: !!announcementId,
  });

  // Control modal open state based on URL parameter
  useEffect(() => {
    if (announcementId) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [announcementId]);

  // Handle dialog close - remove the URL parameter
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open && announcementId) {
      // Remove the announcementId parameter when closing
      setParams({}, { replace: true });
    }
  };

  // Rendering a standalone modal - NO DIALOG TRIGGER NEEDED
  if (!announcementId) {
    // Don't render anything if no ID in URL
    return null;
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-3xl">
          <div>
            <div className="mb-3 flex justify-between">
              <div>
                <Skeleton className="bg-gray-200 h-6 w-48" />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Skeleton className="bg-gray-200 h-4 w-24" />
                  <Skeleton className="bg-gray-200 h-4 w-32" />
                  <Skeleton className="bg-gray-200 h-4 w-4 rounded-full" />
                </div>
              </div>
            </div>

            <Skeleton className="bg-gray-200 mb-4 h-20 w-full" />
            <Skeleton className="bg-gray-200 mb-6 h-48 w-full" />

            <div className="flex items-end justify-between">
              <Skeleton className="bg-gray-200 h-5 w-14 rounded-3xl" />
            </div>

            <Skeleton className="bg-gray-200 mt-6 h-1 w-full" />

            <div className="mt-4">
              <Skeleton className="bg-gray-200 mb-2 h-5 w-32" />
              <div className="space-y-2">
                <Skeleton className="bg-gray-200 h-16 w-full" />
                <Skeleton className="bg-gray-200 h-16 w-full" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
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
      <DialogContent className="w-full max-w-3xl">
        {data && <Announcement announcement={data} isModal={true} />}
      </DialogContent>
    </Dialog>
  );
};

AnnouncementModal.displayName = "AnnouncementModal";

export default AnnouncementModal;
