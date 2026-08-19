import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllFeedback } from "@/services/feedBackService";
import { Title } from "@/components/Title";
import { Icon } from "@iconify/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThreeDotsIcon } from "@/assets/icons/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import useFeedback from "@/hooks/useFeedbacks";
import { Loader2 } from "lucide-react";

const Feedback = () => {
  const { updateFeedbackStatusHandler } = useFeedback();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["feedbacks", statusFilter],
    queryFn: ({ pageParam }) =>
      getAllFeedback({ page: pageParam, status: statusFilter }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.nextPage ? lastPage.currentPage + 1 : undefined,
  });

  const observerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = observerRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [observerRef, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleStatusUpdate = (id, status) => {
    updateFeedbackStatusHandler(id, status);
  };

  const handleStatusChange = (value) => {
    setSearchParams({ status: value }); // Update the URL with the new status
  };

  if (isLoading)
    return (
      <div className="grid h-full place-content-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (isError)
    return (
      <p className="py-8 text-center text-red-500">Error loading feedbacks!</p>
    );

  // Flatten all feedback items from all pages
  const allFeedback = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="container mx-auto py-6">
      <Title className="mb-2">Feedback</Title>

      {/* Filter by status */}
      <div className="my-4 flex items-center gap-4">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Table>
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[200px]">Subject</TableHead>
              <TableHead className="w-[400px]">Description</TableHead>
              <TableHead>Attachment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[150px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allFeedback.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center">
                  No feedback submissions found
                </TableCell>
              </TableRow>
            ) : (
              allFeedback.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="font-medium">{feedback?.name ? feedback?.name : "-"}</TableCell>
                  <TableCell className="font-medium">{feedback?.email}</TableCell>
                  <TableCell className="font-medium">
                    {feedback.subject}
                  </TableCell>
                  <TableCell>{feedback.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {feedback.feedback_files?.map((file) => (
                        <Dialog key={file.id}>
                          <DialogTrigger asChild>
                            <img
                              src={file.url}
                              alt={file.name}
                              className="h-16 w-16 cursor-pointer rounded border object-cover transition-opacity hover:opacity-80"
                            />
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-5xl">
                            <DialogHeader>
                              <DialogTitle className="truncate pr-8 text-left sr-only">
                                Attachment
                              </DialogTitle>
                              <DialogDescription className="sr-only">Attachment</DialogDescription>
                            </DialogHeader>
                            <img
                              src={file.url}
                              alt={file.name}
                              className="max-h-[80vh] w-full rounded object-contain"
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                      {!feedback.feedback_files?.length && (
                        <span className="text-gray-400">No attachment</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {feedback.status === "pending" ? (
                        <Icon
                          icon="material-symbols:circle"
                          color="orange"
                          width={12}
                        />
                      ) : (
                        <Icon
                          icon="material-symbols:circle"
                          color="green"
                          width={12}
                        />
                      )}
                      {feedback.status?.charAt(0).toUpperCase() +
                        feedback.status?.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <ThreeDotsIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {feedback.status === "pending" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(feedback.id, "resolved")
                            }
                          >
                            Mark as resolved
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(feedback.id, "pending")
                            }
                          >
                            Mark as pending
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {hasNextPage && (
        <div ref={observerRef} className="text-gray-400 py-4 text-center">
          {isFetchingNextPage && "Loading..."}
        </div>
      )}
    </div>
  );
};

export default Feedback;
