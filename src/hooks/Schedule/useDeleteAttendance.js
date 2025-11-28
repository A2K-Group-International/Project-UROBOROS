import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { deleteAttendanceRecord } from "@/services/attendanceService";

export const useDeleteAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteAttendanceRecord(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance record deleted successfully!",
      });
      queryClient.invalidateQueries(["event-attendance"]);
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Record",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
};
