import useInterObserver from "@/hooks/useInterObserver";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchFamilies } from "@/services/familyService";
import Loading from "@/components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "@/assets/icons/icons";
import AddParent from "../AddParent";
import AddChild from "../AddChild";
import EditParent from "../EditParent";
import EditChild from "../EditChild";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icon } from "@iconify/react";

const FamiyList = () => {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const debouncedSearch = useDebounce(search, 500);

  const {
    data,
    isLoading,
    _refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["family-list", debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchFamilies({
        page: pageParam,
        pageSize: 10,
        search,
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

  if (error) {
    return <div>Error loading families.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-start md:w-[30rem]">
        <div className="relative w-8/12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 transform text-2xl text-accent" />
          <Input
            value={search}
            onChange={handleSearch}
            className="border-none pl-12"
            placeholder="Search family"
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        data?.pages?.flatMap((page) =>
          page?.items?.map((family) => (
            <Card key={family.id} className="p-2">
              <CardHeader className="p-2">
                <CardTitle className="font-montserrat font-bold text-accent">
                  {family?.users?.first_name} {family?.users?.last_name} Family
                </CardTitle>
                <CardDescription className="sr-only">
                  Family Details
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 p-1">
                {/* Parent(s) */}
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-accent">
                      Parent(s)/ Guardian(s)
                    </h3>
                    <AddParent
                      familyId={family?.id}
                      familyFirstName={family?.users?.first_name}
                      familyLastName={family?.users?.last_name}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Icon
                          className="h-5 w-5 text-primary-text"
                          icon="mingcute:question-line"
                        />
                      </PopoverTrigger>
                      <PopoverContent>
                        <p>{`This button allows you to add a family member for ${family?.users?.first_name} ${family?.users?.last_name}`}</p>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {family.parents && (
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="w-[20rem]">
                          Name
                        </TableHead>
                        <TableHead className="w-[25rem]">Contact</TableHead>
                        <TableHead >Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {family?.parents?.map((parent, i) => (
                        <TableRow
                          key={i}
                          className={cn(
                            i % 2 !== 0
                              ? "bg-primary bg-opacity-35"
                              : "bg-white"
                          )}
                        >
                          <TableCell className="text-nowrap rounded-l-lg py-2 md:p-4 capitalize">
                            <p>{`${parent.first_name} ${parent.last_name}`}</p>
                          </TableCell>
                          <TableCell className="text-nowrap py-1 md:p-4">
                            <p>{`${parent.contact_number}`}</p>
                          </TableCell>
                          <TableCell className="rounded-r-lg py-1 md:p-4">
                            <EditParent parent={parent} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Children */}
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-accent">
                    Children
                  </h3>
                  <AddChild
                    familyId={family?.id}
                    familyFirstName={family?.users?.first_name}
                    familyLastName={family?.users?.last_name}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Icon
                        className="h-5 w-5 text-primary-text"
                        icon="mingcute:question-line"
                      />
                    </PopoverTrigger>
                    <PopoverContent>
                      <p>{`This button allows you to add a family member for ${family?.users?.first_name} ${family?.users?.last_name}`}</p>
                    </PopoverContent>
                  </Popover>
                </div>
                {family?.children && (
                  <Table>
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="w-[20rem]">Name</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {family?.children.length < 1 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">
                            <div className="flex w-full items-center justify-center">
                              <p>No data found.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {family?.children.map((child, i) => (
                        <TableRow
                          key={i}
                          className={cn(
                            i % 2 !== 0
                              ? "bg-primary bg-opacity-35"
                              : "bg-white"
                          )}
                        >
                          <TableCell className="text-nowrap py-2 md:p-4 capitalize">
                            <p>{`${child.first_name} ${child.last_name}`}</p>
                          </TableCell>
                          <TableCell className="py-2 md:p-4">
                            <EditChild child={child} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))
        )
      )}
      {/* Loading Next Page */}
      {isFetchingNextPage && <Loading />}

      {/* Trigger for infinite scroll */}
      {hasNextPage && <div ref={ref}></div>}
    </div>
  );
};

export default FamiyList;
