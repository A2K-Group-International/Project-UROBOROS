import PropTypes from "prop-types";
import { Description, Title } from "../Title";
import { Icon } from "@iconify/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const PollInformation = ({ poll, isMobile, isSheetOpen, setSheetOpen }) => {
  const pollContent = poll ? (
    <>
      <Title className={`${isMobile ? "text-xl" : "text-2xl"}`}>
        {poll.title}
      </Title>
      <Description>{poll.description}</Description>
    </>
  ) : (
    <div className="flex h-full flex-col items-center justify-center py-8">
      <Icon
        icon="mingcute:file-search-line"
        className="mb-3 text-accent/50"
        width={isMobile ? 48 : 64}
        height={isMobile ? 48 : 64}
      />
      <Title className="text-center text-lg">No Poll Selected</Title>
      <Description className="text-center text-sm">
        Select a poll from the list to view details
      </Description>
    </div>
  );

  // For mobile: Display content inside a sheet
  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-full overflow-y-scroll border-none"
          side="right"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="sr-only flex items-center justify-between">
              Poll Details
            </SheetTitle>
            <SheetDescription className="sr-only">
              This is the poll information. You can view and manage the details
              here.
            </SheetDescription>
          </SheetHeader>
          <div className="px-1">{pollContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop: Display content directly
  return <>{pollContent}</>;
};

PollInformation.propTypes = {
  poll: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    responses: PropTypes.number,
  }),
  isMobile: PropTypes.bool,
  isSheetOpen: PropTypes.bool,
  setSheetOpen: PropTypes.func,
};

export default PollInformation;
