import { useEffect, useState } from "react";
import { Description, Title } from "@/components/Title";
import { useUser } from "@/context/useUser";
import { fetchPolls } from "@/services/pollServices";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import PollListCard from "./PollListCard";
import PollListInformation from "./PollListInformation";

const PollList = () => {
  // Access user data from context
  const { userData } = useUser();
  // State to manage selected poll card and mobile view
  const [selectedPollCard, setSelectedPollCard] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  //   Seperate fetching backend
  const {
    data: pollsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["polls", userData?.id],
    queryFn: () => fetchPolls({ user_id: userData?.id }),
    enabled: !!userData?.id,
  });

  // Function to handle poll card selection
  const handlePollCardSelect = (poll) => {
    if (isMobile) {
      setSheetOpen(true);
    }
    setSelectedPollCard(poll);
  };

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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

    return pollsData.map((poll) => (
      <PollListCard
        key={poll.id}
        title={poll.name}
        description={poll.description}
        expiryDate={poll.expiration_date}
        // expiryTime={poll.expiryTime}
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
          <Title className="text-2xl">Polling List</Title>
          <Description>
            Share your availability and preferences by voting in polls.
          </Description>
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
            <PollListInformation poll={selectedPollCard} isMobile={false} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Select a poll to view details.</p>
            </div>
          )}
        </div>
      )}

      {/* MOBILE VIEW (Sheet) */}
      {isMobile && selectedPollCard && (
        <PollListInformation
          poll={selectedPollCard}
          isMobile={true}
          isSheetOpen={sheetOpen}
          setSheetOpen={setSheetOpen}
        />
      )}
    </div>
  );
};

export default PollList;
