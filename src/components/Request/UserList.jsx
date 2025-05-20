import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";

import NewProfileForm from "@/components/NewProfileForm";
import { Skeleton } from "@/components/ui/skeleton";

import useInterObserver from "@/hooks/useInterObserver";
import { cn } from "@/lib/utils";

import { getUsers } from "@/services/userService";
import FamilyCards from "@/components/Request/FamilyCards";
import { Icon } from "@iconify/react";

const UsersList = () => {
  const [tab, setTab] = useState("parishioner");
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const {
    data,
    isLoading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["users-list", tab],
    queryFn: async ({ pageParam }) => {
      const roles = tab === "parishioner" ? ["parishioner", "coparent"] : [tab];
      const response = await getUsers({
        // activeFilter,
        page: pageParam,
        pageSize: 10,
        roles,
      });

      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.nextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });

  const { ref } = useInterObserver(fetchNextPage);

  const onDialogStateChange = (state) => {
    setOpen(state);
    if (!state) {
      setSelectedRow(null);
      refetch();
    }
  };

  const onRowEdit = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  if (error) return <div>Error: {error.message}</div>;
  return (
    <>
      <div>
        <Tabs
          onValueChange={(value) => setTab(value)}
          defaultValue={tab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="parishioner">Parishioners</TabsTrigger>
            <TabsTrigger value="volunteer">Volunteers</TabsTrigger>
            <TabsTrigger value="coordinator">Coordinators</TabsTrigger>
            <TabsTrigger value="family">Families</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="mt-2 flex h-fit w-fit items-center gap-3">
          <Dialog open={open} onOpenChange={onDialogStateChange}>
            <DialogTrigger asChild>
              <Button>Create User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {!selectedRow ? "Create New Profile" : "Update Profile"}
                </DialogTitle>
                <DialogDescription>
                  {!selectedRow
                    ? "Create a new user profile"
                    : "Update existing user profile"}
                </DialogDescription>
              </DialogHeader>
              <NewProfileForm
                user={selectedRow}
                onClose={() => setOpen(false)}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button form="new-user-form">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {isLoading && tab !== "family" && <Loading />}
      {!isLoading && tab !== "family" && (
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-center">Name</TableHead>
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
                  <TableCell className="w-[300px] text-center">
                    {`${row.first_name} ${row.last_name}`}
                  </TableCell>
                  <TableCell className="w-[300px] text-center">
                    {row.email}
                  </TableCell>
                  <TableCell className="w-[300px] text-center">
                    {row.contact_number}
                  </TableCell>

                  <TableCell className="w-[300px] text-center">
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

      {tab === "family" && <FamilyCards />}
    </>
  );
};

export default UsersList;
