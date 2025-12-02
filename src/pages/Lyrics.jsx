import { Description, Title } from "@/components/Title";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSong } from "@/hooks/useSong";

import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const Lyrics = () => {
  const navigate = useNavigate();
  const { getAllSongsQuery, isLoadingAllSongs } = useSong();

  if (isLoadingAllSongs) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6 py-6 lg:py-0">
      <div className="flex flex-col gap-1">
        <Title>Lyrics Management</Title>
        <Description>Manage lyrics for the parish</Description>
      </div>
      <div>
        <Button onClick={() => navigate("/lyrics/add-song")}>
          <Icon className="h-4 w-4 text-white" icon="mingcute:add-fill" />
          Add song
        </Button>
      </div>
      <Table>
        <TableHeader className="bg-primary">
          <TableRow>
            <TableHead className="rounded-l-lg text-center">
              Song number
            </TableHead>
            <TableHead className="rounded-r-lg text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getAllSongsQuery.data.map((row, i) => (
            <TableRow
              key={row.id}
              className={cn(
                i % 2 !== 0 ? "bg-primary bg-opacity-35" : "bg-white"
              )}
            >
              <TableCell className="w-[300px] rounded-l-lg text-center">
                {row.number}
              </TableCell>
              <TableCell className="w-[300px] rounded-r-lg text-center">
                <Button
                  variant="outline"
                  className="h-auto rounded-xl px-2 text-accent hover:text-orange-500"
                >
                  <Icon icon="mingcute:pencil-3-line" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Lyrics;
