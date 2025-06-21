import { useEffect, useState } from "react";
import Addpoll from "@/components/Poll-Management/Addpoll";
import Pollcard from "@/components/Poll-Management/Pollcard";
import PollInformation from "@/components/Poll-Management/PollInformation";
import { Description, Title } from "@/components/Title";
import { useUser } from "@/context/useUser";
import { fetchPollsByUser } from "@/services/pollServices";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

import { useSearchParams } from "react-router-dom";

const Poll = () => {
  // Access user data from context
  const { userData } = useUser();
  // State to manage selected poll card and mobile view
  const [selectedPollCard, setSelectedPollCard] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // GET URL SEACH PARAMS
  const [searchParams, setSearchParams] = useSearchParams();
  const pollIdFromUrl = searchParams.get("id");

  const {
    data: pollsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["polls", userData?.id],
    queryFn: () => fetchPollsByUser({ user_id: userData?.id }),
    enabled: !!userData?.id,
  });

  // Function to handle poll card selection
  const handlePollCardSelect = (poll) => {
    if (isMobile) {
      setSheetOpen(true);
    }
    setSelectedPollCard(poll);

    // Update URL when a poll is selected
    setSearchParams({ id: poll.id });
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind is 1024px
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile); // Cleanup
  }, []);

  // Effect to select the first poll by default on desktop when data loads
  useEffect(() => {
    if (!isMobile && pollsData && pollsData.length > 0 && !selectedPollCard) {
      setSelectedPollCard(pollsData[0]);
    }
    // If on mobile and a poll was selected, then screen resizes to desktop,
    // and no poll is selected, select the first one.
    // If on desktop and pollsData becomes empty, clear selection.
    if (!isMobile && pollsData && pollsData.length === 0) {
      setSelectedPollCard(null);
    }
  }, [pollsData, isMobile, selectedPollCard]);

  // Add this effect to handle URL poll ID selection
  useEffect(() => {
    // Only run this when both pollIdFromUrl and pollsData are available
    if (pollIdFromUrl && pollsData?.length > 0) {
      // Find the poll that matches the ID from URL
      const pollFromUrl = pollsData.find((poll) => poll.id === pollIdFromUrl);

      if (pollFromUrl) {
        setSelectedPollCard(pollFromUrl);
        // If on mobile, open the sheet
        if (isMobile) {
          setSheetOpen(true);
        }
      }
    }
  }, [pollIdFromUrl, pollsData, isMobile]);

  // Default selection behavior (when no URL parameter)
  useEffect(() => {
    // Only apply default selection if:
    // 1. No poll ID in URL
    // 2. We have poll data
    // 3. No poll is currently selected
    // 4. We're on desktop
    if (
      !pollIdFromUrl &&
      !isMobile &&
      pollsData?.length > 0 &&
      !selectedPollCard
    ) {
      setSelectedPollCard(pollsData[0]);
    }

    // Clear selection if on desktop and no polls available
    if (!isMobile && pollsData?.length === 0) {
      setSelectedPollCard(null);
    }
  }, [pollsData, isMobile, selectedPollCard, pollIdFromUrl]);

  const renderPollCards = () => {
    if (isLoading) {
      return (
        // Show a few skeleton loaders
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))
      );
    }

    if (isError) {
      return (
        <div className="text-red-500">
          Error fetching polls: {error?.message || "An unknown error occurred"}
        </div>
      );
    }

    if (!pollsData || pollsData.length === 0) {
      return <p>No polls available at the moment.</p>;
    }

    return pollsData?.map((poll) => (
      <Pollcard
        key={poll.id}
        title={poll.name}
        description={poll.description}
        response={poll.answer_count || 0} // Changed from answers_count based on service
        expiryDate={poll.expiration_date}
        onClick={() => handlePollCardSelect(poll)}
        isActive={selectedPollCard?.id === poll.id}
      />
    ));
  };

  return (
    <div className="no-scrollbar grid h-full gap-x-8 overflow-scroll lg:grid-cols-[0.6fr,1.3fr]">
      {/* LEFT VIEW */}
      <div className="no-scrollbar flex flex-col overflow-y-scroll p-2">
        <div className="mb-4">
          <Title className="text-2xl">Poll Management</Title>
          <Description>Create and manage polls for your church.</Description>
        </div>
        <div className="mb-4">
          <Addpoll />
          {/* Consider passing a refetch function from useQuery to Addpoll to trigger refresh on new poll */}
        </div>
        {/* POLL CARDS */}
        <div className="no-scrollbar flex flex-1 flex-col gap-y-2 overflow-y-auto">
          {renderPollCards()}
        </div>
      </div>

      {/* RIGHT VIEW (Desktop) */}
      {!isMobile && (
        <div className="no-scrollbar hidden overflow-y-scroll rounded-xl border border-accent/40 p-8 lg:block">
          {selectedPollCard ? (
            <PollInformation poll={selectedPollCard} isMobile={false} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Select a poll to view details.</p>
            </div>
          )}
        </div>
      )}

      {/* MOBILE VIEW (Sheet) */}
      {isMobile && selectedPollCard && (
        <PollInformation
          poll={selectedPollCard}
          isMobile={true}
          isSheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
        />
      )}
    </div>
  );
};

export default Poll;
