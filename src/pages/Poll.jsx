import { useEffect, useState } from "react";
import Addpoll from "@/components/Poll-Management/Addpoll";
import Pollcard from "@/components/Poll-Management/Pollcard";
import PollInformation from "@/components/Poll-Management/PollInformation";
import { Description, Title } from "@/components/Title";

const dummyPolls = [
  {
    id: "poll-1",
    title: "Sunday Service Time Preference",
    description: "Help us determine the best time for our Sunday services.",
    responses: 75,
    expiryDate: new Date(2025, 4, 15), // July 15, 2025
    expiryTime: "18:00", // 6:00 PM
  },
  {
    id: "poll-2",
    title: "Community Outreach Focus",
    description:
      "Which area of community outreach should our church prioritize for the next quarter?",
    status: "active",
    responses: 42,
    expiryDate: new Date(2025, 6, 30), // June 30, 2025
    expiryTime: "23:59", // 11:59 PM
  },
  {
    id: "poll-3",
    title: "Bible Study Topic Selection",
    description:
      "What topic would you like to explore in our next Bible study series?",
    responses: 50,
    expiryDate: new Date(2025, 8, 5), // August 5, 2025
    expiryTime: "12:00", // 12:00 PM
  },
];

const Poll = () => {
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
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkMobile();

    // Add listener for window resize
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="grid h-full gap-x-8 lg:grid-cols-[0.6fr,1.3fr]">
      {/* LEFT VIEW */}
      <div className="p-2">
        <div className="mb-4">
          <Title className="text-2xl">Poll Management</Title>
          <Description>Create and manage polls for your church.</Description>
        </div>
        <div className="mb-4">
          <Addpoll />
        </div>
        {/* POLL CARDS */}
        <div className="flex flex-col gap-y-2">
          {dummyPolls.map((poll) => (
            <Pollcard
              key={poll.id}
              title={poll.title}
              description={poll.description}
              expiryDate={poll.expiryDate}
              expiryTime={poll.expiryTime}
              response={poll.responses}
              onClick={() => handlePollCardSelect(poll)}
              isActive={selectedPollCard?.id === poll.id}
            />
          ))}
        </div>
      </div>

      {/* RIGHT VIEW */}
      <div className="hidden rounded-xl border border-accent/40 p-6 lg:block">
        <PollInformation poll={selectedPollCard} isMobile={false} />
      </div>

      {/* MOBILE VIEW */}
      {isMobile && (
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
