import { useState } from "react";
import ConsultationDialog from "@/components/Consultation/ConsultationDialog";
import { Title } from "@/components/Title";
import ConsultationQuestion from "@/components/Consultation/ConsultationQuestion";
import { cn } from "@/lib/utils";

const Consultation = () => {
  const [showConsultationDialog, setShowConsultationDialog] = useState(true);

  // Close the consultation dialog
  const handleCloseDialog = () => {
    setShowConsultationDialog(false);
  };

  return (
    <>
      {showConsultationDialog && (
        <ConsultationDialog onClose={handleCloseDialog} />
      )}
      <div className="border-b border-accent/20 px-2 py-6 lg:p-8">
        <Title>{`Sunday Mass Times at St Laurence's`}</Title>
      </div>
      {/* Main Content */}
      <div
        className={cn(
          "transition-opacity duration-500",
          showConsultationDialog ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="mx-2 my-4 text-accent lg:mx-10 lg:my-6">
          <div className="rounded-xl bg-primary p-4 lg:p-6">
            <p className="text-[12px] font-medium md:text-[15px] lg:text-[16px]">
              Listed below are three sets of possible new Mass-time patterns
              allowing more time between Masses. Please rank in accordance to
              your preference (1st - your top choice, 2nd - your second choice,
              etc.)
            </p>
          </div>
          <ConsultationQuestion />
        </div>
      </div>
    </>
  );
};

export default Consultation;
