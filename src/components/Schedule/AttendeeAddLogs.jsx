import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../ui/table";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { useQuery } from "@tanstack/react-query";
  import { cn } from "@/lib/utils";
  import PropTypes from "prop-types";
  import Loading from "../Loading";
  import { Icon } from "@iconify/react";
  import { fetchAttendanceEditLogs } from "@/services/attendanceService";

  
  const ParentAddLogs = ({ family_id }) => {
    const { data, isLoading } = useQuery({
      queryKey: ["family_add_logs", family_id],
      queryFn: async () => fetchAttendanceEditLogs({ family_id }),
      enabled: !!family_id,
    });

  
    if (data?.length < 1 || !data) {
      return;
    } else {
      return (
        <Dialog>
          <DialogTrigger>
            <Icon
              className="h-5 w-5 text-accent"
              icon={"mingcute:history-line"}
            ></Icon>
          </DialogTrigger>
          <DialogContent className="no-scrollbar max-h-[550px] max-w-[950px] overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>Family Add Logs</DialogTitle>
              <DialogDescription>
                This table shows the added members by admins.
              </DialogDescription>
            </DialogHeader>
            <div className="no-scrollbar overflow-y-scroll">
              {isLoading ? (
                <Loading />
              ) : (
                <Table className=" ">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Contact Tel No.</TableHead>
                      <TableHead>Added At</TableHead>
                      <TableHead>Added By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((log, i) => (
                      <TableRow
                        key={i}
                        className={cn(
                          i % 2 !== 0 ? "bg-primary bg-opacity-35" : "bg-white"
                        )}
                      >
                        <TableCell>{log?.first_name}</TableCell>
                        <TableCell>{log?.last_name}</TableCell>
                        <TableCell>{log?.mobile_number}</TableCell>
                        <TableCell>
                          {new Date(log?.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{`${log?.users?.first_name} ${log?.users?.last_name}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    }
  };
  
  ParentAddLogs.propTypes = {
    family_id: PropTypes.string,
  };
  
  export default ParentAddLogs;
  