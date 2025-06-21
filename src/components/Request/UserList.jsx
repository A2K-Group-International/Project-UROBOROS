import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import useInterObserver from "@/hooks/useInterObserver";
import { cn } from "@/lib/utils";
import FamilyCards from "@/components/Request/FamilyCards";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
import useManageUsers from "@/hooks/Request/useManageUser";

const UsersList = ({ role, onRowEdit }) => {
  const { usersQuery } = useManageUsers({ role });
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = usersQuery;

  const { ref } = useInterObserver(fetchNextPage);

  if (error) return <div>Error: {error.message}</div>;
  return (
    <>
      {isLoading && role !== "family" && <Loading />}
      {!isLoading && role !== "family" && (
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="rounded-l-lg text-center">Name</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Contact Tel No.</TableHead>

              <TableHead className="rounded-r-lg text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.pages?.flatMap((page) =>
              page?.items?.map((row, j) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    j % 2 !== 0 ? "bg-primary bg-opacity-35" : "bg-white"
                  )}
                >
                  <TableCell className="w-[300px] rounded-l-lg text-center">
                    {`${row.first_name} ${row.last_name}`}
                  </TableCell>
                  <TableCell className="w-[300px] text-center">
                    {row.email}
                  </TableCell>
                  <TableCell className="w-[300px] text-center">
                    {row.contact_number}
                  </TableCell>

                  <TableCell className="w-[300px] rounded-r-lg text-center">
                    <Button
                      onClick={() => onRowEdit(row)}
                      variant="outline"
                      className="h-auto rounded-xl px-2 text-accent hover:text-orange-500"
                    >
                      <Icon icon="mingcute:pencil-3-line" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
            {hasNextPage && (
              <TableRow ref={ref}>
                <TableCell colSpan={4}>
                  {isFetchingNextPage && (
                    <Skeleton className="h-10 w-full rounded-xl" />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* {hasNextPage && tab !== "family" &&<Skeleton className="h-32 w-full rounded-xl" />} */}

      {role === "family" && <FamilyCards />}
    </>
  );
};

UsersList.propTypes = {
  role: PropTypes.oneOf(["parishioner", "volunteer", "coordinator", "family"])
    .isRequired,
  onRowEdit: PropTypes.func.isRequired,
};

export default UsersList;
