import { z } from "zod";
import { stringWhiteSpaceValidation } from "@/lib/validationHelpers";

export const addSongSchema = z.object({
  song_number: z.coerce
    .number({ invalid_type_error: "Song number must be a number" })
    .positive("Song number must be positive")
    .int("Song number must be number"),
  lyrics: stringWhiteSpaceValidation("Lyrics"),
});
