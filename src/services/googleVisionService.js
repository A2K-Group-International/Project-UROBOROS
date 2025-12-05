import { supabase } from "@/services/supabaseClient";

export const googleVisionService = {
  analyzeImage: async (base64Image) => {
    const { data, error } = await supabase.functions.invoke(
      "google-vision-ocr",
      {
        body: { base64Image },
      }
    );

    if (error) {
      console.error("Edge Function Error:", error);
      throw new Error("Failed to analyze image with Google Vision.");
    }

    return data.text;
  },
};
