import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getEventsCalendar, getAllEventsForCalendar } from "@/services/eventService";
import { fetchUserMinistryIds } from "@/services/ministryService";

/**
 * Custom hook for fetching events with infinite scroll and calendar events
 */
export const useEventsCalendar = (options = {}) => {
  const {
    userId,
    limit = 12,
    enabled = true
  } = options;

  // Fetch user ministry IDs with longer cache time
  const { 
    data: ministryIds, 
    isLoading: ministryLoading,
    error: ministryError 
  } = useQuery({
    queryKey: ["user-ministries", userId],
    queryFn: () => fetchUserMinistryIds(userId),
    enabled: !!userId && enabled,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
  });

  // Fetch all events for calendar (includes past events)
  const { 
    data: calendarEvents, 
    isLoading: calendarLoading,
    error: calendarError 
  } = useQuery({
    queryKey: ["all-events-calendar", ministryIds],
    queryFn: () => getAllEventsForCalendar(ministryIds),
    enabled: !!ministryIds && enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 20 * 60 * 1000, // Keep in cache for 20 minutes
    retry: 2,
  });

  // Infinite query for upcoming events
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: eventsLoading,
    isFetching,
    error: eventsError,
    refetch
  } = useInfiniteQuery({
    queryKey: ["events-infinite", ministryIds, limit],
    queryFn: ({ pageParam = 1 }) => getEventsCalendar(ministryIds, {
      page: pageParam,
      limit,
      cursor: pageParam > 1 ? pageParam : null
    }),
    enabled: !!ministryIds && enabled,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.pagination?.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000, // Cache for 3 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Flatten all events from infinite pages
  const allEvents = infiniteData?.pages?.flatMap(page => page.data) || [];

  return {
    // Data
    events: allEvents,
    calendarEvents: calendarEvents?.data || [],
    ministryIds: ministryIds || [],
    
    // Loading states
    isLoading: ministryLoading || eventsLoading,
    isFetching,
    isFetchingNextPage,
    isMinistryLoading: ministryLoading,
    isEventsLoading: eventsLoading,
    isCalendarLoading: calendarLoading,
    
    // Error states
    error: ministryError || eventsError || calendarError,
    ministryError,
    eventsError,
    calendarError,
    
    // Methods
    fetchNextPage,
    refetch,
    
    // Computed values
    hasEvents: allEvents.length > 0,
    isEmpty: !ministryLoading && !eventsLoading && allEvents.length === 0,
    hasNextPage,
    canLoadMore: hasNextPage && !isFetchingNextPage,
  };
};

export default useEventsCalendar;