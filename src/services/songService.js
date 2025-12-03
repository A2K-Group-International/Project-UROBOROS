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

  getAllSongs: async ({ page = 1, pageSize = 10, search = "" } = {}) => {
    let query = supabase
      .from("songs")
      .select("id, number, lyrics", { count: "exact" });

    if (search) {
      if (!isNaN(search)) {
        query = query.eq("number", search);
      } else {
        query = query.textSearch("lyrics", search, {
          type: "websearch",
          config: "english",
        });
      }
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order("number", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Error fetching songs:", error);
      throw new Error(error.message);
    }

    return { data, count };
  },

  getSongById: async (id) => {
    const { data, error } = await supabase
      .from("songs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching song:", error);
      throw new Error(error.message);
    }

    return data;
  },

  updateSong: async ({ id, song_number, lyrics }) => {
    const { data, error } = await supabase
      .from("songs")
      .update({ number: song_number, lyrics })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating song:", error);
      throw new Error(error.message);
    }

    return data;
  },

  deleteSong: async (id) => {
    const { error } = await supabase.from("songs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting song:", error);
      throw new Error(error.message);
    }
  },

  checkSongNumberExists: async (song_number, excludeId = null) => {
    let query = supabase
      .from("songs")
      .select("id")
      .eq("number", song_number);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for "JSON object requested, multiple (or no) rows returned"
      // When using .single(), if no rows are found, it throws this error, which means it doesn't exist (good).
      console.error("Error checking song number:", error);
      throw new Error(error.message);
    }

    return !!data;
  },
};
