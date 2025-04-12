import axios from "axios";
import { supabase } from "@/services/supabaseClient";

/**
 * Gets the current auth token from Supabase session
 * @returns {Promise<string>} The current auth token or empty string if not authenticated
 */
export const getAuthToken = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || "";
  } catch (error) {
    console.error("Error getting auth token:", error);
    return "";
  }
};

/**
 * Sends time out notification and records the time out
 * @param {Object} data - Time out data
 * @param {string} data.attendeeId - ID of the attendee being timed out
 * @param {string[]} data.selectedParentsEmails - Optional array of parent emails to notify
 * @returns {Promise} - Result of the time out operation
 */
export const timeOutAttendeeWithNotification = async (data) => {
  try {
    const { attendeeId, selectedParentsEmails = [] } = data;

    // Get the auth token for the API request (now async)
    const authToken = await getAuthToken();

    // Make the API request to your backend
    const { data: result } = await axios.post(
      //   `https://uroboros-api.onrender.com/time-out-attendee` ||
      `https://uroboros-api.onrender.com/timeout/time-out-attendee`,
      // `http://localhost:3000/timeout/time-out-attendee`,
      {
        attendeeId,
        selectedParentsEmails,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return {
      success: true,
      message:
        selectedParentsEmails.length > 0
          ? `Attendee timed out and notifications sent to ${selectedParentsEmails.length} parents`
          : "Attendee timed out successfully",
      details: result,
    };
  } catch (error) {
    console.error("Error in timeOutAttendeeWithNotification:", error);
    throw new Error(
      error.response?.data?.message || "Failed to time out attendee"
    );
  }
};
