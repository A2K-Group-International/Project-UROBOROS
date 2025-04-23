import axios from "axios";

const publicCreateFeedback = async (data) => {
  try {
    const { feedback } = data;
    const { data: result } = await axios.post(
      `${import.meta.env.VITE_SPARKD_API_URL}/feedbacks/create`,
      data,
      {
        feedback,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return {
      success: true,
      message: "Feedback submitted successfully",
      details: result,
    };
  } catch (error) {
    console.error("Error in submitting feedback:", error);
    throw new Error(
      error.response?.data?.message || "Failed to submit feedback"
    );
  }
};

export { publicCreateFeedback };
