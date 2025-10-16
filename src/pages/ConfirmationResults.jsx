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
import { useState } from "react";

const ConfirmationResults = () => {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const { userData } = useUser();
  const [searchParams] = useSearchParams();
  const ministryId = searchParams.get("id");
  const navigate = useNavigate();

  const { data: isCoordinator, isLoading: isLoadingCoordinator } =
    useGetUserCoordinator(userData?.id, ministryId);
  const { data: registrationData, isLoading: isLoadingRegistrations } =
    useGetConfirmRegistration(page, perPage);

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

  const confirmationRegistrations = registrationData?.data || [];
  const totalPages = registrationData?.totalPages || 1;
  const totalCount = registrationData?.count || 0;

  return (
    <div className="flex flex-col gap-4 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(-1)} variant="ghost">
            <Icon icon="mdi:arrow-left" fontSize={20} color="currentColor" />
          </Button>
          <Title>Confirmation Registration Results</Title>
        </div>
        <div className="text-sm text-primary-text">
          Total Registrations: {totalCount}
        </div>
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
            {confirmationRegistrations.length > 0 ? (
              confirmationRegistrations.map((item) => (
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
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  No registrations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-primary-text">
            Showing{" "}
            {confirmationRegistrations.length > 0
              ? (page - 1) * perPage + 1
              : 0}{" "}
            to {Math.min(page * perPage, totalCount)} of {totalCount} results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Icon icon="mdi:chevron-left" fontSize={20} />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {/* Show first page */}
              {page > 3 && (
                <>
                  <Button
                    variant={page === 1 ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(1)}
                  >
                    1
                  </Button>
                  {page > 4 && <span className="px-2">...</span>}
                </>
              )}

              {/* Show surrounding pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p >= page - 2 && p <= page + 2)
                .map((p) => (
                  <Button
                    key={p}
                    variant={page === p ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}

              {/* Show last page */}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && <span className="px-2">...</span>}
                  <Button
                    variant={page === totalPages ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <Icon icon="mdi:chevron-right" fontSize={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationResults;
