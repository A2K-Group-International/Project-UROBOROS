import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { songService } from "@/services/songService";
import { useToast } from "@/hooks/use-toast";

export const useSong = (id = null) => {
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

  const updateSongMutation = useMutation({
    mutationFn: songService.updateSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      queryClient.invalidateQueries({ queryKey: ["song", id] });
      toast({
        title: "Success",
        description: "Song updated successfully.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update song.",
      });
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: songService.deleteSong,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs"] });
      toast({
        title: "Success",
        description: "Song deleted successfully.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete song.",
      });
    },
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const getAllSongsQuery = useQuery({
    queryKey: ["songs", page, search],
    queryFn: () => songService.getAllSongs({ page, search }),
    placeholderData: (previousData) => previousData,
  });

  const getSongByIdQuery = useQuery({
    queryKey: ["song", id],
    queryFn: () => songService.getSongById(id),
    enabled: !!id,
  });

  return {
    addSong: addSongMutation.mutateAsync,
    isAdding: addSongMutation.isPending,
    updateSong: updateSongMutation.mutateAsync,
    isUpdating: updateSongMutation.isPending,
    deleteSong: deleteSongMutation.mutateAsync,
    isDeleting: deleteSongMutation.isPending,
    getSongById: songService.getSongById,
    getAllSongsQuery,
    getSongByIdQuery,
    isLoadingAllSongs: getAllSongsQuery.isLoading,
    page,
    setPage,
    search,
    setSearch,
  };
};
