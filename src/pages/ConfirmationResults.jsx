import { Title } from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/useUser";
import {
  useGetConfirmRegistration,
  useGetUserCoordinator,
} from "@/hooks/use-confirmation-form";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConfirmationDetailsCard from "@/components/ConfirmationDetailsCard";

const ConfirmationResults = () => {
  const { userData } = useUser();
  const [searchParams] = useSearchParams();
  const ministryId = searchParams.get("id");
  const navigate = useNavigate();

  const { data: isCoordinator, isLoading: isLoadingCoordinator } =
    useGetUserCoordinator(userData?.id, ministryId);
  const { data: confirmationRegistrations, isLoading: isLoadingRegistrations } =
    useGetConfirmRegistration();

  if (isLoadingCoordinator || isLoadingRegistrations) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isCoordinator || !ministryId) {
    return (
      <div className="text-red-500">
        You do not have permission to view this page.
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <Icon icon="mdi:arrow-left" fontSize={20} color="currentColor" />
        </Button>
        <Title>Confirmation Registration Results</Title>
      </div>
      {/* Table view */}
      <div>
        <Table className="text-primary-text">
          <TableHeader className="border-b border-neutral-200">
            <TableRow>
              <TableHead className="w-[300px]">Registered by</TableHead>
              <TableHead className="w-[300px]">Email</TableHead>
              <TableHead className="w-[300px]">Contact No.</TableHead>
              <TableHead>Candidate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {confirmationRegistrations?.map((item) => (
              <TableRow key={item.id} className="border-b border-neutral-200">
                <TableCell>
                  {item.users?.first_name} {item.users?.last_name}
                </TableCell>
                <TableCell>{item.users?.email}</TableCell>
                <TableCell>{item.users?.contact_number}</TableCell>
                <TableCell>
                  <ConfirmationDetailsCard data={item.data} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
export default ConfirmationResults;
