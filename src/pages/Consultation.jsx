import { useState } from "react";
import ConsultationDialog from "@/components/Consultation/ConsultationDialog";
import { Title } from "@/components/Title";
import ConsultationQuestion from "@/components/Consultation/ConsultationQuestion";
import { cn } from "@/lib/utils";
import { checkConsultationExistence } from "@/services/consultationServices";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/Loading";
import { useUser } from "@/context/useUser";
import { Icon } from "@iconify/react";

const Consultation = () => {
  const { userData } = useUser();
  const [showConsultationDialog, setShowConsultationDialog] = useState(true);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["consultationExistence"],
    queryFn: async () => await checkConsultationExistence(userData?.id),
    enabled: !!userData?.id && showConsultationDialog === false,
  });
  // Close the consultation dialog
  const handleCloseDialog = () => {
    setShowConsultationDialog(false);
  };
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-semibold text-accent">{`${error}`}</h1>
      </div>
    );
  }
  console.log("Consultation data: ", data?.consultationExist);

  return (
    <div className="flex h-full flex-col">
      {showConsultationDialog && (
        <ConsultationDialog onClose={handleCloseDialog} />
      )}
      <div className="border-b border-accent/20 px-2 py-6 lg:p-8">
        <Title>{`Sunday Mass Times at St Laurence's`}</Title>
      </div>
      {/* Main Content */}
      <div
        className={cn(
          "flex-grow transition-opacity duration-500",
          showConsultationDialog ? "opacity-0" : "opacity-100"
        )}
      >
        {data?.consultationExist ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Icon
              className="h-80 w-80 text-accent"
              icon={"mingcute:check-circle-fill"}
            />
            {data?.consultationExist?.user_id === userData?.id && (
              <h1 className="text-center text-2xl font-semibold text-accent">
                Your preference have been recorded.
              </h1>
            )}
            {data?.consultationExist?.user_id !== userData?.id && (
              <p className="text-center text-2xl font-semibold text-accent">
                {`${data?.consultationExist?.users?.first_name} ${data?.consultationExist?.users?.last_name} has already submitted their preference in behalf of your family.`}
              </p>
            )}
            <h1 className="text-center text-2xl font-semibold text-accent">
              Thank you for your participation!
            </h1>
          </div>
        ) : (
          <div className="mx-2 my-4 text-accent lg:mx-10 lg:my-6">
            <div className="rounded-xl bg-primary p-4 lg:p-6">
              <p className="text-[12px] font-medium md:text-[15px] lg:text-[16px]">
                Listed below are three sets of possible new Mass-time patterns
                allowing more time between Masses. Please rank in accordance to
                your preference (1st - your top choice, 2nd - your second
                choice, etc.)
              </p>
            </div>
            <ConsultationQuestion />
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
