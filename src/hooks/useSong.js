import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { songService } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";

export const useSong = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addSongMutation = useMutation({
    mutationFn: songService.addSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast({
        title: "Success",
        description: "Song added successfully.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add song.",
      });
    },
  });

  const getAllSongsQuery = useQuery({
    queryKey: ["songs"],
    queryFn: songService.getAllSongs,
  });

  return {
    addSong: addSongMutation.mutateAsync,
    isAdding: addSongMutation.isPending,
    getAllSongsQuery,
    isLoadingAllSongs: getAllSongsQuery.isLoading,
  };
};
