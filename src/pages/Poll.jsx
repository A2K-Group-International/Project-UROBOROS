import Addpoll from "@/components/Poll-Management/Addpoll";
import Pollcard from "@/components/Poll-Management/Pollcard";
import { Description, Title } from "@/components/Title";

const dummyPolls = [
  {
    id: "poll-1",
    title: "Sunday Service Time Preference",
    description: "Help us determine the best time for our Sunday services.",
    responses: 75,
  },
  {
    id: "poll-2",
    title: "Community Outreach Focus",
    description:
      "Which area of community outreach should our church prioritize for the next quarter?",
    status: "active",
    responses: 42,
  },
  {
    id: "poll-3",
    title: "Bible Study Topic Selection",
    description:
      "What topic would you like to explore in our next Bible study series?",
    responses: 50,
  },
];

const Poll = () => {
  return (
    <div className="grid h-full grid-cols-[0.6fr,1.3fr] gap-x-8">
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
              response={poll.responses}
            />
          ))}
        </div>
      </div>

      {/* RIGHT VIEW */}
      <div className="rounded-xl border border-accent/40 p-6">
        <Title className="text-2xl">Poll Information (In progress)</Title>
        <Description>In progress</Description>
      </div>
    </div>
  );
};

export default Poll;
