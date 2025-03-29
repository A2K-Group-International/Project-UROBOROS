import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import {
  getAttendanceFromExistingRecord,
  searchAttendee,
  updateAttendee,
} from "@/services/attendanceService";
import { useDebounce } from "@/hooks/useDebounce";
import { Label } from "../ui/label";
import useInterObserver from "@/hooks/useInterObserver";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import { useUser } from "@/context/useUser";
import {
  useAddAttendee,
  useAddWalkInAttendee,
  useRemoveAttendee,
  useRemoveWalkInAttendee,
  useUpdateWalkInAttendee,
} from "@/hooks/Schedule/useAddRecord";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Icon } from "@iconify/react";

const AddExistingRecord = ({ eventId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceSearchTerm = useDebounce(searchTerm, 500);
  const [loadingAddAttendeeId, setLoadingAddAttendeeId] = useState(null);
  const [loadingRemoveAttendeeId, setLoadingRemoveAttendeeId] = useState(null);

  const queryClient = useQueryClient();
  const userData = useUser();
  const userId = userData?.userData?.id;

  const { mutate: addAttendeeMutation } = useAddAttendee(eventId, userId);
  const { mutate: removeAttendeeMutation } = useRemoveAttendee(eventId);
  const { mutate: addWalkInAttendeeMutation } = useAddWalkInAttendee(
    eventId,
    userId
  );
  const { mutate: removeWalkInAttendeeMutation } =
    useRemoveWalkInAttendee(eventId);

  const { mutate: updateWalkInAttendeeMutation } =
    useUpdateWalkInAttendee(eventId);

  // Fetch existing attendees
  const { data: attendanceData } = useQuery({
    queryKey: ["event-attendance", eventId],
    queryFn: () => getAttendanceFromExistingRecord(eventId),
    enabled: !!eventId,
  });

  // Track existing attendees
  const {
    existingAttendees,
    attendanceStatus,
    existingWalkInAttendees,
    walkInAtendeeStatus,
  } = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        existingAttendees: new Set(),
        attendanceStatus: new Map(),
        existingWalkInAttendees: new Set(),
        walkInAtendeeStatus: new Map(),
      };
    }

    return {
      existingAttendees: new Set(attendanceData.map((a) => a.attendee_id)),
      attendanceStatus: new Map(
        attendanceData.map((a) => [a.attendee_id, a.attended])
      ),
      existingWalkInAttendees: new Set(
        attendanceData.map(
          (a) => `${a.first_name.trim()} ${a.last_name.trim()}`
        )
      ),
      walkInAtendeeStatus: new Map(
        attendanceData.map((a) => [
          `${a.first_name.trim()} ${a.last_name.trim()}`,
          a.attended,
        ])
      ),
    };
  }, [attendanceData]);

  // Update infinite query configuration
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["search-attendees", debounceSearchTerm],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await searchAttendee({
          searchTerm: debounceSearchTerm,
          page: pageParam,
          pageSize: 10,
        });
        return response;
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.hasMore) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  // Extract all parents from all pages
  const allParents = useMemo(() => {
    if (!data?.pages) return [];

    // Create a Map to track unique parents by ID

    const uniqueParents = new Map();

    // Process all pages
    data.pages.forEach((page) => {
      page.parents?.forEach((parent) => {
        if (!uniqueParents.has(parent.id)) {
          uniqueParents.set(parent.id, parent);
        }
      });
    });

    return Array.from(uniqueParents.values());
  }, [data?.pages]);

  // Extract all children from all pages
  const allChildren = useMemo(() => {
    if (!data?.pages) return [];

    // Create a Map to track unique children by ID
    const uniqueChildren = new Map();

    // Process all pages
    data.pages.forEach((page) => {
      page.children?.forEach((child) => {
        if (!uniqueChildren.has(child.id)) {
          uniqueChildren.set(child.id, child);
        }
      });
    });

    return Array.from(uniqueChildren.values());
  }, [data?.pages]);

  const allWalkIns = useMemo(() => {
    if (!data?.pages) return [];

    // Create a Map to track unique walk-ins by ID
    const uniqueWalkIns = new Map();

    // Process pages in order
    data.pages.forEach((page) => {
      page.walkInAttendees?.forEach((walkIn) => {
        // Only add if we haven't seen this ID before
        if (!uniqueWalkIns.has(walkIn.id)) {
          uniqueWalkIns.set(walkIn.id, walkIn);
        }
      });
    });

    return Array.from(uniqueWalkIns.values());
  }, [data?.pages]);

  const handleAddAttendee = (
    attendeeId,
    firstName,
    lastName,
    familyId,
    contactNumber,
    attendeeType
  ) => {
    setLoadingAddAttendeeId(attendeeId);
    addAttendeeMutation(
      {
        attendeeId,
        firstName,
        lastName,
        familyId,
        contactNumber,
        attendeeType,
      },
      {
        onSettled: () => {
          setTimeout(() => {
            setLoadingAddAttendeeId(null);
          }, 500);
        },
        onError: () => {
          setLoadingAddAttendeeId(null);
        },
      }
    );
  };

  // Remove attendee from record
  const handleRemoveAttendee = (attendeeId) => {
    setLoadingRemoveAttendeeId(attendeeId);
    removeAttendeeMutation(attendeeId, {
      onSettled: () => {
        setTimeout(() => {
          setLoadingRemoveAttendeeId(null);
        }, 500);
      },
      onError: () => {
        setLoadingRemoveAttendeeId(null);
      },
    });
  };

  // Update attendee status (NEED TO OPTIMIZE USING MUTATION)
  const onAttend = async (attendeeId, state) => {
    try {
      // Fix parameter order - eventId first, then state
      await updateAttendee(attendeeId, eventId, state);

      // Update query key to match the one used in useQuery
      await queryClient.invalidateQueries(["attendance", eventId]);
      await queryClient.invalidateQueries(["event-attendance", eventId]);
      await queryClient.invalidateQueries({
        queryKey: ["search-attendees"],
      });
    } catch (error) {
      console.error("Error updating attendee status:", error);
    }
  };

  const handleWalkInAddAttendee = (
    firstName,
    lastName,
    familyId,
    contactNumber,
    attendeeType
  ) => {
    setLoadingAddAttendeeId(`${firstName} ${lastName}`);
    addWalkInAttendeeMutation(
      {
        firstName,
        lastName,
        familyId,
        contactNumber,
        attendeeType,
      },
      {
        onSettled: () => {
          setTimeout(() => {
            setLoadingAddAttendeeId(null);
          }, 500);
          // Invalidate and refetch the query to update the UI
          queryClient.invalidateQueries(["event-attendance", eventId]);
        },
        onError: () => {
          setLoadingAddAttendeeId(null);
        },
      }
    );
  };

  const handleRemoveWalkInAttendee = (firstName, lastName) => {
    setLoadingRemoveAttendeeId(`${firstName} ${lastName}`);
    removeWalkInAttendeeMutation(
      { firstName, lastName },
      {
        onSettled: () => {
          setTimeout(() => {
            setLoadingRemoveAttendeeId(null);
          }, 500);
          // Invalidate and refetch the query to update the UI
          queryClient.invalidateQueries(["event-attendance", eventId]);
        },
        onError: () => {
          setLoadingRemoveAttendeeId(null);
        },
      }
    );
  };

  const handleUpdateWalkInAttendee = (firstName, lastName, state) => {
    updateWalkInAttendeeMutation({ firstName, lastName, state });
  };

  // intersection observer for infinite scroll
  const { ref } = useInterObserver(hasNextPage ? fetchNextPage : null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add from Record</Button>
      </DialogTrigger>
      <DialogContent className="no-scrollbar block h-[42rem] overflow-y-scroll sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add from Existing Record</DialogTitle>
          <DialogDescription>
            Add a new record from the existing in the database.
          </DialogDescription>
          <div className="flex h-10 items-center rounded-full bg-primary px-2">
            <SearchIcon className="h-4 w-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full border-0 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {allParents?.length === 0 &&
              allChildren?.length === 0 &&
              allWalkIns?.length === 0 ? (
                <Label className="flex items-center justify-center">
                  No data found
                </Label>
              ) : (
                <>
                  {/* Parents Section */}
                  {allParents.length > 0 && (
                    <div className="space-y-2 rounded-lg bg-primary p-2">
                      <Label className="text-primary-text">
                        Parents/Guardians
                      </Label>
                      <ul className="space-y-2">
                        {allParents.map((parent) => (
                          <li
                            key={parent?.id}
                            className="rounded-lg bg-white px-5 py-1 text-primary-text"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-x-2">
                                {existingAttendees?.has(parent.id) && (
                                  <Switch
                                    checked={attendanceStatus?.get(parent.id)}
                                    onCheckedChange={(checked) =>
                                      onAttend(parent.id, checked)
                                    }
                                  />
                                )}
                                <Label>
                                  {parent.first_name} {parent.last_name}
                                </Label>
                              </div>
                              <div>
                                {existingAttendees?.has(parent.id) ? (
                                  <Button
                                    disabled={
                                      loadingRemoveAttendeeId == parent.id
                                    }
                                    onClick={() =>
                                      handleRemoveAttendee(parent.id)
                                    }
                                    className="rounded-xl bg-red-100 text-[12px] text-red-600"
                                  >
                                    {loadingRemoveAttendeeId === parent.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Remove"
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    disabled={loadingAddAttendeeId == parent.id}
                                    onClick={() =>
                                      handleAddAttendee(
                                        parent.id,
                                        parent.first_name,
                                        parent.last_name,
                                        parent.family_id,
                                        parent.contact_number,
                                        "parents"
                                      )
                                    }
                                    className="rounded-xl bg-[#EFDED6] text-[12px] text-primary-text"
                                  >
                                    {loadingAddAttendeeId === parent.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Add"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Children Section */}
                  {allChildren.length > 0 && (
                    <div className="space-y-2 rounded-lg bg-primary p-2">
                      <Label className="text-primary-text">Children</Label>
                      <ul className="space-y-2">
                        {allChildren.map((child) => (
                          <li
                            key={child.id}
                            className="rounded-lg bg-white px-5 py-1 text-primary-text"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-x-2">
                                {existingAttendees.has(child.id) && (
                                  <Switch
                                    checked={attendanceStatus.get(child.id)}
                                    onCheckedChange={(checked) =>
                                      onAttend(child.id, checked)
                                    }
                                  />
                                )}
                                <Label>
                                  {child.first_name} {child.last_name}
                                </Label>
                              </div>
                              <div>
                                {existingAttendees.has(child.id) ? (
                                  <Button
                                    disabled={
                                      loadingRemoveAttendeeId === child.id
                                    }
                                    onClick={() =>
                                      handleRemoveAttendee(child.id)
                                    }
                                    className="rounded-xl bg-red-100 text-[12px] text-red-600"
                                  >
                                    {loadingRemoveAttendeeId === child.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Remove"
                                    )}
                                  </Button>
                                ) : (
                                  <Button
                                    disabled={loadingAddAttendeeId === child.id}
                                    onClick={() =>
                                      handleAddAttendee(
                                        child.id,
                                        child.first_name,
                                        child.last_name,
                                        child.family_id,
                                        child.contact_number,
                                        "children"
                                      )
                                    }
                                    className="rounded-xl bg-[#EFDED6] text-[12px] text-primary-text"
                                  >
                                    {loadingAddAttendeeId === child.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Add"
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Keep your existing Walk-ins section which is already correct */}

                  {allWalkIns.length > 0 && (
                    <div className="space-y-2 rounded-lg bg-primary p-2">
                      <div className="flex items-center justify-center gap-x-2 text-center text-primary-text">
                        <Label className="text-xs font-semibold text-primary-text md:text-sm">
                          Manual Record (from Walk-in and Volunteers input)
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Icon
                              className="h-5 w-5"
                              icon="mingcute:question-line"
                            />
                          </PopoverTrigger>
                          <PopoverContent>
                            <p>
                              This section displays attendance records added
                              from walk-ins and volunteers.
                            </p>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {/* Walk-ins Section */}
                      {allWalkIns.map((walkIn) => (
                        <div
                          key={walkIn.id}
                          className="rounded-lg bg-white px-5 py-1 text-primary-text"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-x-2">
                              {existingWalkInAttendees?.has(
                                `${walkIn.first_name} ${walkIn.last_name}`
                              ) && (
                                <Switch
                                  checked={walkInAtendeeStatus?.get(
                                    `${walkIn.first_name} ${walkIn.last_name}`
                                  )}
                                  onCheckedChange={(checked) =>
                                    handleUpdateWalkInAttendee(
                                      walkIn.first_name,
                                      walkIn.last_name,
                                      checked
                                    )
                                  }
                                />
                              )}
                              <Label>
                                {walkIn.first_name} {walkIn.last_name}
                              </Label>
                            </div>
                            <div>
                              {existingWalkInAttendees?.has(
                                `${walkIn.first_name} ${walkIn.last_name}`
                              ) ? (
                                <Button
                                  disabled={
                                    loadingRemoveAttendeeId ===
                                    `${walkIn.first_name} ${walkIn.last_name}`
                                  }
                                  onClick={() =>
                                    handleRemoveWalkInAttendee(
                                      walkIn.first_name,
                                      walkIn.last_name
                                    )
                                  }
                                  className="rounded-xl bg-red-100 text-[12px] text-red-600"
                                >
                                  {loadingRemoveAttendeeId ===
                                  `${walkIn.first_name} ${walkIn.last_name}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Remove"
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  disabled={
                                    loadingAddAttendeeId ===
                                    `${walkIn.first_name} ${walkIn.last_name}`
                                  }
                                  onClick={() =>
                                    handleWalkInAddAttendee(
                                      walkIn.first_name,
                                      walkIn.last_name,
                                      walkIn.family_id,
                                      walkIn.contact_number,
                                      walkIn.attendee_type
                                    )
                                  }
                                  className="rounded-xl bg-[#EFDED6] text-[12px] text-primary-text"
                                >
                                  {loadingAddAttendeeId ===
                                  `${walkIn.first_name} ${walkIn.last_name}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Add"
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* div for intersection observer */}
              {hasNextPage && (
                <div ref={ref} className="h-4">
                  {isFetchingNextPage && (
                    <div className="flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SearchIcon = (props) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
};

AddExistingRecord.propTypes = {
  eventId: PropTypes.string.isRequired,
};

export default AddExistingRecord;
