import { useEffect, useState } from "react"; // Added useState and useEffect
import Addpoll from "@/components/Poll-Management/Addpoll";
import Pollcard from "@/components/Poll-Management/Pollcard";
import PollInformation from "@/components/Poll-Management/PollInformation";
import { Description, Title } from "@/components/Title";
import { useUser } from "@/context/useUser";
import { fetchPolls } from "@/services/pollServices";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming this is the correct path

const Poll = () => {
  const { userData } = useUser();
  const {
    data: pollsData, // Renamed to pollsData for clarity
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["polls", userData?.id], // Added userData.id to queryKey for dependency
    queryFn: () => fetchPolls({ user_id: userData?.id }),
    enabled: !!userData?.id, // Query will only run if userData.id exists
  });

  const [selectedPollCard, setSelectedPollCard] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
      <Pollcard
        key={poll.id}
        title={poll.name}
        description={poll.description}
        response={poll.answer_count || 0} // Changed from answers_count based on service
        expiryDate={poll.expiration_date}
        // expiryTime={poll.expiryTime} // Assuming expiryTime is part of poll or derived
        onClick={() => handlePollCardSelect(poll)}
        isActive={selectedPollCard?.id === poll.id}
      />
    ));
  };

  return (
    <div className="grid h-full gap-x-8 lg:grid-cols-[0.6fr,1.3fr]">
      {/* LEFT VIEW */}
      <div className="flex h-full flex-col p-2">
        <div className="mb-4">
          <Title className="text-2xl">Poll Management</Title>
          <Description>Create and manage polls for your church.</Description>
        </div>
        <div className="mb-4">
          <Addpoll />{" "}
          {/* Consider passing a refetch function from useQuery to Addpoll to trigger refresh on new poll */}
        </div>
        {/* POLL CARDS */}
        <div className="no-scrollbar flex flex-1 flex-col gap-y-2 overflow-y-auto">
          {renderPollCards()}
        </div>
      </div>

      {/* RIGHT VIEW (Desktop) */}
      {!isMobile && (
        <div className="hidden rounded-xl border border-accent/40 p-6 lg:block">
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
      {isMobile &&
        selectedPollCard && ( // Only render sheet if a poll is selected
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
