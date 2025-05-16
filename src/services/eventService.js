import { paginate } from "@/lib/utils";
import { supabase } from "@/services/supabaseClient"; // Ensure supabase client is imported
import { deleteImageFromStorage } from "./ministryService";

// // Function to create an event
// export const createEvent = async (eventData) => {
//   try {
//     const {
//       eventName,
//       eventCategory,
//       eventVisibility,
//       ministry,
//       eventDate, // formatted date from the form
//       eventTime, // formatted time from the form
//       eventDescription,
//       userId, // Creator's ID
//       assignVolunteer, // Array of volunteer IDs
//     } = eventData;

//     // Step 1: Insert event data into Supabase
//     const { data: event, error: eventError } = await supabase
//       .from("events")
//       .insert([
//         {
//           event_name: eventName,
//           event_category: eventCategory,
//           event_visibility: eventVisibility,
//           ministry_id: ministry || null, // Ministry is optional
//           event_date: eventDate, // formatted date (yyyy-MM-dd)
//           event_time: eventTime, // formatted time (HH:mm:ss)
//           event_description: eventDescription || null, // Optional field
//           creator_id: userId, // Assuming userId is passed in the form data
//         },
//       ])
//       .select("id") // Return the new event ID
//       .single(); // Single object

//     if (eventError) {
//       throw new Error(eventError.message); // Handle any errors
//     }

//     // Step 2: Insert assigned volunteers into event_volunteers table
//     if (assignVolunteer?.length > 0) {
//       const volunteerData = assignVolunteer.map((volunteerId) => ({
//         event_id: event.id, // Use the created event ID
//         volunteer_id: volunteerId,
//       }));

//       const { error: volunteerError } = await supabase
//         .from("event_volunteers")
//         .insert(volunteerData);

//       if (volunteerError) {
//         throw new Error(volunteerError.message); // Handle any errors
//       }
//     }

//     return { success: true, data: event }; // Return success structure
//   } catch (error) {
//     console.error("Error creating event:", error);
//     return { success: false, error: error.message }; // Return error structure
//   }
// };

export const createEvent = async (eventData) => {
  const {
    eventName,
    eventCategory,
    eventVisibility,
    ministry,
    eventDate,
    eventTime,
    eventObservation,
    eventDescription,
    userId, // Creator's ID
    assignVolunteer,
    eventPosterImage,
  } = eventData;

  try {
    //  Upload the image (if provided)
    let imagePath = null;
    if (eventPosterImage) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Uroboros")
        .upload(`event_images/${eventName}_${Date.now()}`, eventPosterImage);

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      imagePath = uploadData.path;
    }

    // Step 1: Insert event data into Supabase
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert([
        {
          event_name: eventName,
          event_category: eventCategory,
          event_visibility: eventVisibility,
          ministry_id: ministry || null,
          event_date: eventDate,
          event_time: eventTime,
          event_description: eventDescription || null,
          creator_id: userId,
          requires_attendance: !eventObservation,
          image_url: imagePath,
        },
      ])
      .select("id") // Return the new event ID
      .single(); // Single object

    if (eventError) {
      if (imagePath) {
        await deleteImageFromStorage();
      } else {
        throw new Error(eventError.message); // Handle any errors
      }
    }

    // Step 2: Insert assigned volunteers into event_volunteers table
    if (assignVolunteer?.length > 0) {
      const volunteerData = assignVolunteer.map((volunteerId) => ({
        event_id: event.id, // Use the created event ID
        volunteer_id: volunteerId,
        assigner_id: userId,
      }));

      const { error: volunteerError } = await supabase
        .from("event_volunteers")
        .insert(volunteerData);

      if (volunteerError) {
        throw new Error(volunteerError.message); // Handle any errors
      }
    }

    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
};

// Function to update an existing event

// export const updateEvent = async (eventData) => {
//   try {
//     const {
//       eventName,
//       eventCategory,
//       eventVisibility,
//       ministry,
//       eventDate, // formatted date from the form
//       eventTime, // formatted time from the form
//       eventDescription,
//       // userId, // Creator's ID
//     } = eventData.updatedData;

//     // Step 1: Update the event data in the 'events' table
//     const { data: updatedEvent, error: eventError } = await supabase
//       .from("events")
//       .update({
//         event_name: eventName,
//         event_category: eventCategory,
//         event_visibility: eventVisibility,
//         ministry_id: ministry || null, // Ministry is optional
//         event_date: eventDate, // formatted date (yyyy-MM-dd)
//         event_time: eventTime, // formatted time (HH:mm:ss)
//         event_description: eventDescription || null, // Optional field
//       })
//       .eq("id", eventData.eventId) // Update the event with the matching ID
//       .select("id") // Return the updated event ID
//       .single(); // Return single object

//     if (eventError) {
//       throw new Error(eventError.message); // Handle any errors
//     }

//     // // Step 2: Remove all existing volunteer assignments for the event
//     // const { error: removeError } = await supabase
//     //   .from("event_volunteers")
//     //   .delete()
//     //   .eq("event_id", eventData.eventId); // Remove all existing volunteer assignments for the event

//     // if (removeError) {
//     //   throw new Error(removeError.message); // Handle any errors
//     // }

//     // // Step 3: Insert new volunteer assignments (if any volunteers are selected)
//     // if (assignVolunteer?.length > 0) {
//     //   const volunteerData = assignVolunteer.map((volunteerId) => ({
//     //     event_id: eventData.eventId, // Use the event ID to assign volunteers
//     //     volunteer_id: volunteerId,
//     //   }));

//     //   const { error: volunteerError } = await supabase
//     //     .from("event_volunteers")
//     //     .insert(volunteerData);

//     //   if (volunteerError) {
//     //     throw new Error(volunteerError.message); // Handle any errors
//     //   }
//     // }

//     return { success: true, data: updatedEvent }; // Return success structure
//   } catch (error) {
//     console.error("Error updating event:", error);
//     return { success: false, error: error.message }; // Return error structure
//   }
// };

export const updateEvent = async ({ eventId, updatedData }) => {
  try {
    const { eventPosterImage, ...eventDetails } = updatedData;

    const updatePayload = {
      event_name: eventDetails.eventName,
      event_category: eventDetails.eventCategory,
      event_visibility: eventDetails.eventVisibility,
      ministry_id: eventDetails.ministry || null,
      event_date: eventDetails.eventDate,
      event_time: eventDetails.eventTime,
      event_description: eventDetails.eventDescription || null,
      requires_attendance: !eventDetails.eventObservation,
    };

    // Step 1: Update the event data in the 'events' table
    const { error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", eventId);

    if (error) {
      throw new Error(error.message);
    }

    // Handle image upload if a new one is provided
    if (eventPosterImage instanceof File) {
      // Get current image URL to delete later
      const { data: currentEvent, error: fetchError } = await supabase
        .from("events")
        .select("image_url")
        .eq("id", eventId)
        .single();

      if (fetchError) {
        throw new Error(`Error fetching current event: ${fetchError.message}`);
      }

      // Generate a unique file name to prevent conflicts
      const fileName = `event_images/${eventDetails.eventName}_${Date.now()}`;

      // Upload new image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Uroboros")
        .upload(fileName, eventPosterImage);

      if (uploadError) {
        throw new Error(`Error uploading new poster: ${uploadError.message}`);
      }

      // Update event with new image URL
      const { error: imageUpdateError } = await supabase
        .from("events")
        .update({ image_url: uploadData.path })
        .eq("id", eventId);

      if (imageUpdateError) {
        // If update fails, remove the uploaded image
        await supabase.storage.from("Uroboros").remove([uploadData.path]);
        throw new Error(
          `Error updating event poster: ${imageUpdateError.message}`
        );
      }

      // Delete old image if exists and is different
      if (
        currentEvent?.image_url &&
        currentEvent.image_url !== uploadData.path
      ) {
        await deleteImageFromStorage(currentEvent.image_url);
      }
    }
    // Handle case where image is explicitly removed (set to null)
    else if (eventPosterImage === null) {
      const { data: currentEvent, error: fetchError } = await supabase
        .from("events")
        .select("image_url")
        .eq("id", eventId)
        .single();

      if (!fetchError && currentEvent?.image_url) {
        // Delete the existing image
        await deleteImageFromStorage(currentEvent.image_url);

        // Update event to clear poster field
        const { error: clearImageError } = await supabase
          .from("events")
          .update({ image_url: null })
          .eq("id", eventId);

        if (clearImageError) {
          throw new Error(
            `Error clearing event image: ${clearImageError.message}`
          );
        }
      }
    }

    // Return the updated event
    const { data: updatedEvent, error: getError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (getError) {
      throw new Error(`Error fetching updated event: ${getError.message}`);
    }

    // Transform image_url to public URL if it exists
    if (updatedEvent.image_url) {
      const { data: urlData } = supabase.storage
        .from("Uroboros")
        .getPublicUrl(updatedEvent.image_url);

      updatedEvent.image_url = urlData.publicUrl;
    }

    return { success: true, data: updatedEvent };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: error.message };
  }
};

// Function to fetch all events (optionally filter by date, creator, etc.)
export const getEvents = async ({
  page = 1,
  pageSize,
  query,
  role,
  userId,
  selectedYear,
  selectedMonth,
} = {}) => {
  try {
    const filters = {};

    // Apply filters for the selected year and month
    if (selectedYear && selectedMonth) {
      const formattedMonth = String(selectedMonth).padStart(2, "0");
      const selectedDate = `${selectedYear}-${formattedMonth}`;

      const [year, month] = selectedDate.split("-");
      const startOfMonth = `${year}-${month}-01`;
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      const endOfMonth = `${year}-${month}-${lastDayOfMonth}`;

      filters.gte = {
        event_date: startOfMonth,
      };
      filters.lte = {
        event_date: endOfMonth,
      };
    }

    if (query) {
      filters.ilike = { event_name: query };
    }

    // Handle role-based access
    if (role === "admin") {
      // Admins can see all events - no additional filters needed
    } else if (role === "volunteer") {
      // Volunteers see events they're assigned to and haven't been replaced
      const { data: volunteerEvents } = await supabase
        .from("event_volunteers")
        .select("event_id")
        .eq("volunteer_id", userId)
        .eq("replaced", false); // Only include assignments where the volunteer hasn't been replaced

      const volunteerEventIds =
        volunteerEvents?.map((event) => event.event_id) || [];

      // Also get events where this volunteer is a replacement
      const { data: replacementEvents } = await supabase
        .from("event_volunteers")
        .select("event_id")
        .eq("replacedby_id", userId);

      const replacementEventIds =
        replacementEvents?.map((event) => event.event_id) || [];

      // Combine both sets of event IDs
      const allEventIds = [
        ...new Set([...volunteerEventIds, ...replacementEventIds]),
      ];

      if (allEventIds.length > 0) {
        filters.id = allEventIds;
      } else {
        filters.id = [];
      }
    } else if (role === "coordinator") {
      // Coordinators only see events they created
      // Get all events created by this coordinator
      const { data: createdEvents } = await supabase
        .from("events")
        .select("id")
        .eq("creator_id", userId);

      if (createdEvents?.length > 0) {
        // If they have created events, set the filter to only show those event IDs
        filters.id = createdEvents.map((event) => event.id);
      } else {
        // If they haven't created any events, return empty results
        filters.id = []; // This ensures no events will be returned
      }
    } else if (role === "parishioner" || role === "coparent") {
      // Parishioners/coparents see:
      // 1. Public events
      // 2. Private events from ministries they belong to via groups
      const { data: groupMemberships } = await supabase
        .from("group_members")
        .select("groups(ministry_id)")
        .eq("user_id", userId);

      const ministryIds =
        groupMemberships
          ?.filter((item) => item.groups?.ministry_id)
          .map((item) => item.groups.ministry_id) || [];

      if (ministryIds.length > 0) {
        // For parishioners with ministry connections, get their ministry's events + public events
        const ministryFilter = `ministry_id.in.(${ministryIds.join(",")})`;
        const visibilityFilter = "event_visibility.eq.public";

        // Get all events that match either condition
        const { data: accessibleEvents } = await supabase
          .from("events")
          .select("id")
          .or(`${ministryFilter},${visibilityFilter}`);

        if (accessibleEvents?.length > 0) {
          filters.id = accessibleEvents.map((event) => event.id);
        } else {
          filters.event_visibility = "public"; // Fallback to just public events
        }
      } else {
        filters.event_visibility = "public"; // If no ministries, only show public events
      }
    }

    const order = [{ column: "event_date", ascending: true }];

    // Fetch data using pagination
    const paginatedData = await paginate({
      key: "events",
      select: `*,creator_id(first_name, last_name), event_volunteers (volunteer_id)`,
      page,
      pageSize,
      filters,
      order,
    });

    // Transform image URLs to public URLs
    if (paginatedData && paginatedData.items) {
      paginatedData.items = paginatedData.items.map((event) => {
        if (event.image_url) {
          return {
            ...event,
            image_url: getPublicImageUrl(event.image_url),
          };
        }
        return event;
      });

      return paginatedData;
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message };
  }
};

// Function to delete an event by its ID
export const deleteEvent = async (eventId) => {
  try {
    // Step 1: Get the event details to retrieve image_url if exists
    const { data: eventData, error: fetchError } = await supabase
      .from("events")
      .select("image_url")
      .eq("id", eventId)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching event details: ${fetchError.message}`);
    }

    // Step 2: Delete the event image from storage if one exists
    if (eventData?.image_url) {
      try {
        await deleteImageFromStorage(eventData.image_url);
      } catch (imageError) {
        console.error("Error deleting event image:", imageError);
        // Continue with event deletion even if image deletion fails
      }
    }

    // Step 3: Delete the event record
    const { data, error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (error) {
      throw new Error(`Error deleting event record: ${error.message}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: error.message };
  }
};

// Function to fetch quick access events
export const getQuickAccessEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("quick_access_events")
      .select("*");

    if (error) {
      throw new Error(error.message);
    }

    return data; // Return only the data directly
  } catch (error) {
    console.error("Error fetching quick access events:", error);
    throw new Error(error.message);
  }
};

// Function to fetch a single event by its ID
export const getEventById = async (eventId) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single(); // Fetch only one record

    if (error) {
      console.error("Error fetching event by ID:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return { success: false, error: error.message };
  }
};

export const getAllEvents = async () => {
  try {
    const { data, error } = await supabase.from("events").select("*"); // Select all columns from the events table

    if (error) {
      throw new Error(error.message); // Handle any errors
    }

    return { success: true, data }; // Return success structure with data
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message }; // Return error structure
  }
};

const getPublicImageUrl = (path) => {
  if (!path) return null;

  // Handle if the path is already a full URL
  if (path.startsWith("http")) {
    return path;
  }

  // Use the Supabase client to get the public URL
  try {
    const { data } = supabase.storage.from("Uroboros").getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error("Error converting image path to URL:", error);
    // Fallback to constructing the URL manually
    return `https://spvkbkqezuwdkngytrnt.supabase.co/storage/v1/object/public/Uroboros/${encodeURIComponent(path)}`;
  }
};

// Updated getEventsCalendar to accept year and month as arguments
export const getEventsCalendar = async (ministry = []) => {
  try {
    // Fetch all public events (no filtering by ministry)
    const publicEventsQuery = supabase
      .from("events")
      .select("*")
      .eq("event_visibility", "public")
      .gte("event_date", new Date().toISOString());

    // Fetch private events filtered by ministry IDs (only if provided)
    const privateEventsQuery =
      ministry.length > 0
        ? supabase
            .from("events")
            .select("*")
            .eq("event_visibility", "private")
            .in("ministry_id", ministry)
            .gte("event_date", new Date().toISOString()) // Apply ministry filter
        : null;

    // Execute both queries
    const publicEventsPromise = publicEventsQuery;
    const privateEventsPromise = privateEventsQuery
      ? privateEventsQuery
      : Promise.resolve({ data: [] });

    // Wait for both queries to resolve
    const [publicEventsResult, privateEventsResult] = await Promise.all([
      publicEventsPromise,
      privateEventsPromise,
    ]);

    // Check for errors in the queries
    if (publicEventsResult.error) {
      throw new Error(publicEventsResult.error.message);
    }
    if (privateEventsResult.error) {
      throw new Error(privateEventsResult.error.message);
    }

    // Combine public and private events
    const allEvents = [...publicEventsResult.data, ...privateEventsResult.data];

    allEvents.sort((a, b) => {
      const dateA = new Date(`${a.event_date}T${a.event_time}`);
      const dateB = new Date(`${b.event_date}T${b.event_time}`);
      return dateA - dateB; // Sort in ascending order (earliest date first)
    });

    allEvents.forEach((event) => {
      if (event.image_url) {
        event.image_url = getPublicImageUrl(event.image_url);
      }
    });

    return { success: true, data: allEvents };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message }; // Return error structure
  }
};

export const fetchEventVolunteers = async (eventId) => {
  try {
    // Query the event_volunteers table for the given event ID
    const { data, error } = await supabase
      .from("event_volunteers")
      .select(
        `
        volunteer_id,
        assigned_at,
        replaced,
        replacedby_id,
        users:volunteer_id (
          first_name,
          last_name,
          email
        ),
         volunteer_replacement:replacedby_id (
          first_name,
          last_name,
          email
        )
        `
      )
      .eq("event_id", eventId); // Filter by event ID

    if (error) {
      throw new Error(error.message); // Handle errors
    }

    return { success: true, data }; // Return the fetched data
  } catch (error) {
    console.error("Error fetching event volunteers:", error);
    return { success: false, error: error.message }; // Return error structure
  }
};

// Function to fetch parishioner events
export const getParishionerEvents = async ({ page = 1, pageSize } = {}) => {
  try {
    // Get the current date in "YYYY-MM-DD" format
    const today = new Date().toISOString().split("T")[0];

    const data = await paginate({
      key: "events",
      page,
      pageSize,
      order: [{ column: "event_date", ascending: true }],
      filters: {
        gte: { event_date: today }, // Include events with dates greater than or equal to today
      },
    });

    return data;
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message };
  }
};

export const getWalkInEvents = async () => {
  // Get the current date in "YYYY-MM-DD" format
  const today = new Date().toISOString().split("T")[0];

  // Query the Supabase database for events
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true })
    .gte("event_date", today);

  if (error) throw error; // React Query will handle this as a query failure

  return data; // Return the data directly
};

export const getEventsByMinistryId = async (ministryIds) => {
  const promises = ministryIds.map(async (ministry) => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("ministry_id", ministry.id);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  });

  const events = await Promise.all(promises);

  return events;
};
export const getEventsByCreatorId = async (userId) => {
  const now = new Date();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("event_date", now.toISOString())
    .eq("creator_id", userId)
    .order("event_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const replaceVolunteer = async ({
  oldVolunteerId,
  eventId,
  replacedby_id,
  replaced,
  newreplacement_id,
}) => {
  if (replaced) {
    const { error } = await supabase
      .from("event_volunteers")
      .update({
        volunteer_id: newreplacement_id,
        replacedby_id,
        replaced: true,
      })
      .eq("event_id", eventId)
      .eq("volunteer_id", oldVolunteerId);

    if (error) {
      throw new Error(error.message);
    }
  }

  const { error } = await supabase
    .from("event_volunteers")
    .update({ replacedby_id, replaced: true })
    .eq("event_id", eventId)
    .eq("volunteer_id", oldVolunteerId);

  if (error) {
    throw new Error(error.message);
  }
};

export const removeAssignedVolunteer = async (volunteerId, eventId) => {
  if (!volunteerId) {
    throw new Error("Volunteer ID is required");
  }
  const { data } = await supabase
    .from("event_volunteers")
    .select("*")
    .eq("volunteer_id", volunteerId)
    .eq("replaced", false)
    .eq("event_id", eventId);

  const { data: replacementData } = await supabase
    .from("event_volunteers")
    .select("*")
    .eq("replacedby_id", volunteerId)
    .eq("replaced", true)
    .eq("event_id", eventId);

  if (data.length > 0) {
    const { error } = await supabase
      .from("event_volunteers")
      .delete()
      .eq("volunteer_id", volunteerId)
      .eq("replaced", false)
      .eq("event_id", eventId);

    if (error) {
      throw new Error(error.message);
    }
  }
  if (replacementData.length > 0) {
    const { error } = await supabase
      .from("event_volunteers")
      .delete()
      .eq("replacedby_id", volunteerId)
      .eq("replaced", true)

      .eq("event_id", eventId);
    if (error) {
      throw new Error(error.message);
    }
  }
};

export const addAssignedVolunteer = async ({
  eventId,
  assignVolunteer,
  userId,
}) => {
  try {
    const getPromises = assignVolunteer.map(async (volunteer_id) => {
      const { data, error } = await supabase
        .from("event_volunteers")
        .select("id")
        .eq("volunteer_id", volunteer_id)
        .eq("event_id", eventId)
        .eq("replaced", false);

      if (error) {
        throw new Error("Error checking existence of volunteers!");
      }

      if (data.length > 0) {
        throw new Error("Volunteer Already Assigned!");
      }

      const { data: replaceIdData, error: replaceIdError } = await supabase
        .from("event_volunteers")
        .select("id")
        .eq("replacedby_id", volunteer_id)
        .eq("event_id", eventId);

      if (replaceIdError) {
        throw new Error("Error checking existence of volunteers!");
      }

      if (replaceIdData.length > 0) {
        throw new Error("Volunteer Already Exist!");
      }
    });

    await Promise.all(getPromises);

    const Promises = assignVolunteer.map(async (volunteer_id) => {
      const { error } = await supabase.from("event_volunteers").insert([
        {
          event_id: eventId,
          assigner_id: userId,
          volunteer_id,
          assigned_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }
    });

    await Promise.all(Promises);
  } catch (err) {
    console.error("Error in adding volunteers:", err);
    throw err; // Ensure the error is propagated back to the mutation's onError handler
  }
};
