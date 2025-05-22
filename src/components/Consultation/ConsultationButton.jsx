import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const ConsultationButton = ({ isMobile = true }) => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    navigate("/consultation");
  };

  if (isMobile) {
    return (
      <div
        className="mt-2 h-full animate-bounce rounded-full border border-accent/30 p-2 lg:hidden"
        onClick={handleNavigation}
      >
        <div className="flex h-full flex-col items-center justify-end">
          <Button variant="ghost" className="relative block h-auto p-0">
            <Icon
              icon="hugeicons:task-daily-01"
              className="text-primary-text"
              fontSize={20}
            />
          </Button>
          <p className="mt-2 text-center text-[7px] font-bold text-accent">
            Consultation
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex h-10 w-full cursor-pointer select-none items-center justify-between rounded-full bg-white py-1 pl-3 pr-1 text-[16px] font-medium text-accent"
      onClick={handleNavigation}
    >
      <div className="flex w-full items-center gap-x-2">
        <Icon icon="hugeicons:task-daily-01" className="h-6 w-6" />
        <span>Consultation</span>
      </div>
      <span className="flex h-full w-12 items-center justify-center rounded-full bg-danger text-white">
        !
      </span>
    </div>
  );
};

ConsultationButton.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

export default ConsultationButton;
