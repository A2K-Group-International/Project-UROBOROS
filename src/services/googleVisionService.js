import axios from "axios";

const API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY;
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

export const googleVisionService = {
  /**
   * Analyzes an image using Google Cloud Vision API for text detection (OCR).
   * @param {string} base64Image - The base64 encoded image string (without the data:image/... prefix).
   * @returns {Promise<string>} - The detected text.
   */
  analyzeImage: async (base64Image) => {
    if (!API_KEY) {
      throw new Error("Google Cloud Vision API Key is missing");
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "DOCUMENT_TEXT_DETECTION",
            },
          ],
        },
      ],
    };

    try {
      const response = await axios.post(API_URL, requestBody);
      const detections = response.data.responses[0].fullTextAnnotation;
      return detections ? detections.text : "";
    } catch (error) {
      console.error("API Error:", error);
      throw new Error("Failed to analyze image with Google Vision.");
    }
  },
};
