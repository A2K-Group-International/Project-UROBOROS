import axios from "axios";
import { supabase } from "./supabaseClient";

const getAuthToken = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error.message);
      return null;
    }

    return session?.access_token || null;
  } catch (err) {
    console.error("Error retrieving token:", err);
    return null;
  }
};

const publicCreateFeedback = async (data) => {
  try {
    const { feedback } = data;
    const { data: result } = await axios.post(
      `${import.meta.env.VITE_SPARKD_API_URL}/feedback/create`,
      // `http://localhost:3000/feedback/create`,
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

const getAllFeedback = async ({ pageParam = null, status = "all" }) => {
  const token = await getAuthToken();
  const params = new URLSearchParams();
  if (pageParam) params.append("cursor", pageParam);
  params.append("limit", "12");
  params.append("status", status);

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SPARKD_API_URL}/feedback`,
      // `http://localhost:3000/feedback`,
      {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch feedbacks"
    );
  }
};

const updateFeedbackStatus = async (id, status) => {
  try {
    const token = await getAuthToken();

    const { data: result } = await axios.patch(
      `${import.meta.env.VITE_SPARKD_API_URL}/feedback/${id}/status`,
      // `http://localhost:3000/feedback/${id}/status`,
      {
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      message: "Status updated successfully",
      details: result,
    };
  } catch (error) {
    console.error("Failed to update feedback status", error);
    throw error;
  }
};

export { publicCreateFeedback, getAllFeedback, updateFeedbackStatus };
