import { supabase } from "./supabaseClient";

export const songService = {
  /**
   * Adds a new song to the database.
   * @param {Object} songData - The song data.
   * @param {number} songData.song_number - The number of the song.
   * @param {string} songData.lyrics - The lyrics of the song.
   * @returns {Promise<Object>} - The inserted song data.
   */
  addSong: async ({ song_number, lyrics }) => {
    const { data, error } = await supabase
      .from("songs")
      .insert([{ number: song_number, lyrics }])
      .select()
      .single();

    if (error) {
      console.error("Error adding song:", error);
      throw new Error(error.message);
    }

    return data;
  },

  getAllSongs: async () => {
    const { data, error } = await supabase.from("songs").select("number");

    if (error) {
      console.error("Error fetching songs:", error);
      throw new Error(error.message);
    }

    return data;
  },
};
