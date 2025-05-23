import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const ConsultationDialog = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false); // for animation

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      {/* Overlay background */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/0 backdrop-blur-none transition-all duration-300 ease-in-out",
          isVisible && "bg-black/60"
        )}
        onClick={handleClose}
      />

      {/* Main Content */}
      <Card
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 translate-y-[-60%] rounded-3xl opacity-0 shadow-lg transition-all duration-300 ease-in-out md:max-w-3xl lg:max-w-4xl",
          isVisible && "translate-y-[-50%] opacity-100"
        )}
      >
        <CardContent className="py-6 text-[13px] md:text-[15px] lg:px-20 lg:py-12 lg:text-[16px]">
          <div className="space-y-4 font-medium text-accent">
            <p>Dear Parishioners</p>
            <p>
              {`We would like to consult with you about Sunday Mass times at St Laurence’s.`}
            </p>
            <p>
              We have been persuaded that there needs to be a change to current
              Sunday morning Mass times. There has long been regret that
              parishioners at the 9.30am cannot socialise after Mass because
              they need immediately to clear the car park for those attending at
              11am. In addition, the congestion in the car park as the 9.30am
              congregation leaves and the 11.00am congregation arrives sometimes
              reaches the point of being a safety{" "}
              <span className="text-[14px] md:text-[16px] lg:text-[18px]">
                risk.
              </span>
            </p>
            <p>
              {`To give me and the Parish Pastoral Council a sense of parishioners’ preferences, please complete the form. Thank you.`}
            </p>

            <p className="font-bold">Fr Robin</p>
          </div>
          <div className="flex justify-end">
            <Button className="rounded-full px-10" onClick={handleClose}>
              Open Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

ConsultationDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ConsultationDialog;
