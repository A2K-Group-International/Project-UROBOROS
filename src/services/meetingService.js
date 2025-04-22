import { supabase } from "./supabaseClient"; // Ensure supabase client is imported
import { paginate } from "@/lib/utils";
import { ROLES } from "@/constants/roles";

// Function to create a meeting
export const createMeeting = async (meetingData) => {
  try {
    const {
      meetingName,
      location,
      details,
      date, // formatted date from the form
      time, // formatted time from the form
      userId, // creator userId from context
      participants, // Array of participant user IDs
    } = meetingData;

    // Insert meeting data into Supabase
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .insert([
        {
          meeting_name: meetingName,
          meeting_date: date, // formatted meeting date (yyyy-MM-dd)
          start_time: time, // formatted start time (HH:mm:ss)
          end_time: time, // Ensure end time is correctly set
          location,
          details,
          creator_id: userId, // Assuming creatorId is passed in the form data
        },
      ])
      .select("id")
      .single(); // Returns the created row as a single object

    if (meetingError) {
      throw new Error(meetingError.message); // Handle any errors with creating the meeting
    }

    // Insert participants into the meeting_participants table
    if (participants && participants.length > 0) {
      const participantData = participants.map((participantId) => ({
        meeting_id: meeting.id,
        user_id: participantId,
      }));

      const { error: participantsError } = await supabase
        .from("meeting_participants")
        .insert(participantData);

      if (participantsError) {
        throw new Error(participantsError.message); // Handle errors when adding participants
      }
    }

    return { success: true, data: meeting }; // Return success with meeting data
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { success: false, error: error.message }; // Return error structure
  }
};

// Function to update an existing meeting
export const updateMeeting = async (meetingId, updatedData) => {
  try {
    const {
      meetingName,

      startTime,
      endTime,
      location,
      details,
      date,
      time,
    } = updatedData;

    // Format meeting date (yyyy-MM-dd)
    const formattedEndTime = endTime || startTime; // Use startTime if endTime is not provided

    // Update meeting data
    const { data, error } = await supabase
      .from("meetings")
      .update({
        meeting_name: meetingName,

        meeting_date: date, // formatted date
        start_time: time, // formatted start time
        end_time: formattedEndTime, // formatted end time
        location,
        details,
        updated_at: new Date(), // Update the `updated_at` field
      })
      .eq("id", meetingId) // Ensure you're updating the correct meeting by its ID
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating meeting:", error);
    return { success: false, error: error.message };
  }
};

export const fetchCalendarMeetings = async (userId) => {
  try {
    // Fetch meetings the user is participating in using a join on meeting_participants and meetings tables
    const { data, error } = await supabase
      .from("meeting_participants")
      .select("meetings(*)") // Get all columns from the meetings table
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    // Return only the meetings part of the result
    return {
      success: true,
      data: data.map((participant) => participant.meetings),
    };
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return { success: false, error: error.message }; // Return error structure
  }
};

// Function to fetch all meetings (optionally filter by date, creator, etc.)
export const getMeetings = async ({
  startDate,
  endDate,
  page = 1,
  pageSize,
  query,
  user,
  selectedYear,
  selectedMonth,
} = {}) => {
  try {
    const filters = {};

    // Apply startDate and endDate filters
    if (startDate) {
      filters.gte = startDate;
    }

    if (endDate) {
      filters.lte = endDate;
    }

    // Apply filters for the selected year and month
    if (selectedYear && selectedMonth) {
      const formattedMonth = String(selectedMonth).padStart(2, "0");
      const selectedDate = `${selectedYear}-${formattedMonth}`; // Example: "2024-12"
      const [year, month] = selectedDate.split("-");

      // Get the first day of the month
      const startOfMonth = `${year}-${month}-01`;

      // Get the last day of the month
      const lastDayOfMonth = new Date(year, month, 0).getDate(); // `month` is 0-indexed
      const endOfMonth = `${year}-${month}-${lastDayOfMonth}`;

      filters.gte = {
        meeting_date: startOfMonth,
      };
      filters.lte = {
        meeting_date: endOfMonth,
      };
    }

    // Filter by meeting name (optional query search)
    if (query) {
      filters.ilike = { meeting_name: query };
    }

    // If the user is not an admin, fetch meetings they are assigned to
    let nonAdminMeetingIds = [];
    if (user && user.role !== ROLES[4]) {
      const { data: participantMeetings, error: participantError } =
        await supabase
          .from("meeting_participants")
          .select("*")
          .eq("user_id", user.id);

      if (participantError) {
        throw new Error(participantError.message);
      }

      nonAdminMeetingIds = participantMeetings.map(
        (meeting) => meeting.meeting_id
      );

      if (nonAdminMeetingIds.length > 0) {
        filters.id = nonAdminMeetingIds; // Apply only the meetings the user is a participant of
      } else {
        // If no meetings are found, you can either:
        // 1. Leave the filters.id as is, or
        // 2. Set filters.id to an empty array or some default value
        filters.id = []; // Example of resetting the filter
      }
    }

    // If the user is an admin or has no specific meetings, apply all meetings

    // Fetch data using pagination
    const data = await paginate({
      key: "meetings",
      page,
      pageSize,
      filters,
    });

    return data;
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return { success: false, error: error.message };
  }
};

// Function to delete a meeting by its ID
export const deleteMeeting = async (meetingId) => {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", meetingId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { success: false, error: error.message };
  }
};

// Function to fetch a single meeting by its ID
export const getMeetingById = async (meetingId) => {
  try {
    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", meetingId)
      .single(); // Fetch only one record

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching meeting by ID:", error);
    return { success: false, error: error.message };
  }
};

export const fetchMeetingParticipants = async (meetingId) => {
  try {
    // Query the meeting_participants table for the given meeting ID
    const { data, error } = await supabase
      .from("meeting_participants")
      .select(
        `
        user_id,
      
        users (
          first_name,
          last_name,
          email
        )
        `
      )
      .eq("meeting_id", meetingId); // Filter by meeting ID

    if (error) {
      throw new Error(error.message); // Handle errors
    }

    // Return the fetched data (or empty array if no data is found)
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching meeting participants:", error);
    return { success: false, error: error.message, data: [] }; // Return empty array in case of an error
  }
};

export const fetchMeetingByCreatorId = async (creatorId) => {
  if (!creatorId) {
    throw new Error("id is required!");
  }

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("creator_id", creatorId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
