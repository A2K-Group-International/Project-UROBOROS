import { Description, Title } from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSong } from "@/hooks/useSong";

import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const Lyrics = () => {
  const navigate = useNavigate();
  const {
    getAllSongsQuery,
    isLoadingAllSongs,
    page,
    setPage,
    search,
    setSearch,
  } = useSong();
  const [searchTerm, setSearchTerm] = useState(search);
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setSearch(debouncedSearch);
    setPage(1); // Reset to page 1 on new search
  }, [debouncedSearch, setSearch, setPage]);

  const handlePrevious = () => {
    if (page > 1) setPage((old) => old - 1);
  };

  const handleNext = () => {
    const totalPages = Math.ceil((getAllSongsQuery.data?.count || 0) / 10);
    if (page < totalPages) {
      setPage((old) => old + 1);
    }
  };

  return (
    <div className="mb-20 flex flex-col gap-6 py-6 lg:mb-0 lg:py-0">
      <div className="flex flex-col gap-1">
        <Title>Lyrics Management</Title>
        <Description>Manage lyrics for the parish</Description>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => navigate("/lyrics/add-song")}>
          <Icon className="h-4 w-4 text-white" icon="mingcute:add-fill" />
          Add song
        </Button>
        <div className="w-[250px]">
          <Input
            placeholder="Search by number or lyrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Table>
        <TableHeader className="bg-primary">
          <TableRow>
            <TableHead className="rounded-l-lg text-center">
              Song number
            </TableHead>
            <TableHead className="text-center">
              Lyrics Preview / First Line
            </TableHead>
            <TableHead className="rounded-r-lg text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingAllSongs ? (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : getAllSongsQuery.data?.data?.length ? (
            getAllSongsQuery.data.data.map((row, i) => (
              <TableRow
                key={row.id}
                className={cn(
                  i % 2 !== 0 ? "bg-primary bg-opacity-35" : "bg-white"
                )}
              >
                <TableCell className="w-[300px] rounded-l-lg text-center">
                  {row.number}
                </TableCell>
                <TableCell className="w-[300px] max-w-[300px] truncate">
                  <Dialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <span className="block cursor-pointer truncate">
                            {row.lyrics?.split("\n")[0]}
                          </span>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[400px] whitespace-pre-wrap">
                        {row.lyrics}
                      </TooltipContent>
                    </Tooltip>
                    <DialogContent className="no-scrollbar max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-primary-text">
                          Song {row.number}
                        </DialogTitle>
                        <DialogDescription className="text-primary-text">
                          Full Lyrics
                        </DialogDescription>
                      </DialogHeader>
                      <div className="whitespace-pre-wrap text-primary-text">
                        {row.lyrics}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell className="w-[300px] rounded-r-lg text-center">
                  <Button
                    variant="outline"
                    className="h-auto rounded-xl px-2 text-accent hover:text-orange-500"
                    onClick={() => navigate(`/lyrics/${row.id}`)}
                  >
                    <Icon icon="mingcute:pencil-3-line" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={page === 1 || isLoadingAllSongs}
        >
          Previous
        </Button>
        <div className="text-sm text-primary-text">Page {page}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={
            !getAllSongsQuery.data?.data?.length ||
            page >= Math.ceil((getAllSongsQuery.data?.count || 0) / 10) ||
            isLoadingAllSongs
          }
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Lyrics;
