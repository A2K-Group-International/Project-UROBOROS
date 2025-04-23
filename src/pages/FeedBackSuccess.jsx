import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const FeedBackSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <Icon icon="mingcute:check-circle-fill" width={200} color="green" />
      <h1 className="text-center text-2xl font-bold text-primary-text">
        Thank you for providing feedback!
      </h1>
      <p className="mt-2 text-accent">{`We'll be back to you soon.`}</p>
      <Button
        variant="ghost"
        onClick={() => navigate("/")} // Navigate back to the home page
        className="mt-4"
      >
        Go to Home
      </Button>
    </div>
  );
};

export default FeedBackSuccess;
