import { supabase } from "@/services/supabaseClient"; // Adjust the import to match the final location of supabaseClient
import { v4 as uuidv4 } from "uuid";

const insertEventAttendance = async (submittedData) => {
  const { randomSixDigit, event, parents, children } = submittedData;

  // get main applicant parent.
  const mainApplicant = parents.find((parent) => parent.isMainApplicant);

  // Insert into the tickets table (this table tracks the tickets themselves)
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .insert([
      {
        event_id: event, // Foreign key for the event
        ticket_code: randomSixDigit, // Unique ticket code (generated six-digit number)
        timestamp: new Date(), // Automatically handled by the database
      },
    ])
    .select();

  if (ticketError) {
    console.error("Error inserting ticket record:", ticketError.message);
    return { success: false, error: ticketError };
  }

  const { data: walkInUser, error: walkInUserError } = await supabase
    .from("walk_in_users")
    .insert({
      registration_id: ticket[0].ticket_id,
      first_name: mainApplicant.parentFirstName,
      last_name: mainApplicant.parentLastName,
      contact_number: mainApplicant.parentContactNumber,
    })
    .select();

  if (walkInUserError) {
    console.error(
      "Error inserting walk-in user record:",
      walkInUserError.message
    );
    return { success: false, error: walkInUserError };
  }

  const { data: familyId, error: familyError } = await supabase
    .from("family_group")
    .insert({
      walk_in_user_id: walkInUser[0].id,
    })
    .select("id");

  if (familyError) {
    console.error("Error inserting family group record:", familyError.message);
    return { success: false, error: familyError };
  }

  // Prepare parent records with ticket_code
  const parentRecords = parents.map((parent) => ({
    first_name: parent.parentFirstName,
    last_name: parent.parentLastName,
    contact_number: parent.parentContactNumber,
    family_id: familyId[0].id,
    main_applicant:
      mainApplicant &&
      parent.parentFirstName === mainApplicant.parentFirstName &&
      parent.parentLastName === mainApplicant.parentLastName,
    type: "parents",
    registration_code: randomSixDigit,
  }));

  const childrenRecords = children.map((child) => ({
    first_name: child.childFirstName,
    last_name: child.childLastName,
    family_id: familyId[0].id,
    type: "children",
    main_applicant: false,
    registration_code: randomSixDigit,
  }));

  // Combine the arrays into a single attendeesData array
  const attendeesData = [...parentRecords, ...childrenRecords];
  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance")
    .insert(
      attendeesData.map((attendee) => ({
        event_id: event,
        attendee_id: attendee.id,
        attendee_type: attendee.type,
        main_applicant:
          attendee.type === "parents" ? attendee.main_applicant : null,
        first_name: attendee.first_name,
        last_name: attendee.last_name,
        contact_number: attendee.contact_number,
        family_id: attendee.family_id,
        registration_code: attendee.registration_code,
      }))
    );

  if (attendanceError) {
    console.error(
      "Error inserting attendance records:",
      attendanceError.message
    );
    return { success: false, error: attendanceError };
  }
  return { success: true, attendanceData };
};

// const { data: parentsData, error: parentsError } = await supabase
//   .from("parents")
//   .upsert(parentRecords)
//   .select();

// if (parentsError) {
//   console.error("Error inserting parent records:", parentsError.message);
//   return { success: false, error: parentsError };
// }

// const { data: childrenData, error: childrenError } = await supabase
//   .from("children")
//   .upsert(childrenRecords)
//   .select();

// if (childrenError) {
//   console.error("Error inserting child records:", childrenError.message);
//   return { success: false, error: childrenError };
// }

// // Add the type property to each item in the parentsData and childrenData arrays
// const parentsWithType = parentsData.map((parent) => ({
//   ...parent,
//   type: "parents",
//   main_applicant:
//     mainApplicant &&
//     parent.first_name === mainApplicant.parentFirstName &&
//     parent.last_name === mainApplicant.parentLastName,
//   contact_number: mainApplicant.contact_number, // Check the main applicant in walk in registration
// }));

// const childrenWithType = childrenData.map((child) => ({
//   ...child,
//   type: "children",
//   main_applicant: null,
// }));

const getEventAttendance = async (eventId) => {
  try {
    // Fetch attendance records for the given event
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*, registered_by:users(first_name,last_name)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
      .order("first_name", { ascending: true })
      .order("id", { ascending: true });
    if (attendanceError) {
      console.error("Error fetching attendance data:", attendanceError);
      return { success: false, error: attendanceError.message };
    }

    if (!attendanceData || attendanceData.length === 0) {
      return { success: true, data: [] }; // Return empty if no attendance
    }

    // Group attendance data by family_id
    const groupedData = attendanceData.reduce((acc, record) => {
      const { family_id, attendee_type, main_applicant, last_name } = record;

      // Find or create a family group
      let familyGroup = acc.find((group) => group.family_id === family_id);
      if (!familyGroup) {
        familyGroup = {
          family_id,
          family_surname: null,
          parents: [],
          children: [],
          registered_by: record.registered_by,
        };
        acc.push(familyGroup);
      }
      // Categorize attendees by type
      if (attendee_type === "parents") {
        familyGroup.parents.push(record);
        if (main_applicant) {
          familyGroup.family_surname = last_name;
        }
      } else if (attendee_type === "children") {
        familyGroup.children.push(record);
      }

      return acc;
    }, []);

    return { success: true, data: groupedData };
  } catch (error) {
    console.error("Error fetching event attendance:", error);
    return { success: false, error: error.message };
  }
};

// Insert main applicant
// export const insertMainApplicant = async (guardiansData) => {
//   try {
//     // Check for existing main_applicant entries before upserting
//     const { data: existingRecords, error: checkError } = await supabase
//       .from("attendance")
//       .select("attendee_id, event_id")
//       .in(
//         "attendee_id",
//         guardiansData.map((guardian) => guardian.attendee_id)
//       )
//       .in(
//         "event_id",
//         guardiansData.map((guardian) => guardian.event_id)
//       );

//     if (checkError) {
//       throw new Error(checkError.message);
//     }

//     // Filter out any guardians who are already registered as main applicants
//     const newGuardiansData = guardiansData.filter((guardian) => {
//       return !existingRecords.some(
//         (record) =>
//           record.attendee_id === guardian.attendee_id &&
//           record.event_id === guardian.event_id
//       );
//     });

//     // Only upsert the new guardians if there are any
//     if (newGuardiansData.length > 0) {
//       const { data, error } = await supabase.from("attendance").upsert(
//         newGuardiansData.map((guardian) => ({
//           event_id: guardian.event_id,
//           attendee_id: guardian.attendee_id,
//           attendee_type: guardian.attendee_type,
//           attended: guardian.attended,
//           main_applicant: guardian.main_applicant,
//           first_name: guardian.first_name,
//           last_name: guardian.last_name,
//           contact_number: guardian.contact_number,
//           family_id: guardian.family_id,
//           registration_code: guardian.registration_code,
//         }))
//       );

//       if (error) {
//         throw new Error(error.message);
//       }

//       return data;
//     } else {
//       // No new guardians to insert, return a message or handle it silently
//       return null;
//     }
//   } catch (error) {
//     console.error("Error adding guardian", error);
//     // Do not throw the error to avoid breaking the flow
//     return null;
//   }
// };

// Parishioner insert family/guardian
export const insertGuardians = async (parentData) => {
  const { data, error } = await supabase
    .from("attendance")
    .insert([
      {
        attendee_id: parentData.id,
        event_id: parentData.event_id,
        attendee_type: parentData.attendee_type,
        attended: parentData.attended,
        main_applicant: parentData.main_applicant,
        family_id: parentData.family_id,
        first_name: parentData.first_name,
        last_name: parentData.last_name,
        contact_number: parentData.contact_number,
        registered_by: parentData.registered_by,
      },
    ])
    .select();

  if (error) throw error;

  // Fetch event data to get event name and other event-related details
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", parentData.event_id)
    .single();

  // Handle any errors when fetching the event data
  if (eventError) {
    console.error("Error fetching event data:", eventError.message);
    throw new Error(`Error fetching event data: ${eventError.message}`);
  }

  // Check if this child has attended this event before
  const { data: existingHistoryAttendees } = await supabase
    .from("previous_attendees")
    .select("first_name, last_name")
    .eq("event_name", eventData.event_name)
    .eq("first_name", parentData.first_name)
    .eq("last_name", parentData.last_name)
    .single();

  // If no previous attendance record is found, insert a new history record
  if (!existingHistoryAttendees) {
    const { error: insertHistoryError } = await supabase
      .from("previous_attendees")
      .insert([
        {
          first_name: parentData.first_name,
          last_name: parentData.last_name,
          event_name: eventData.event_name,
          family_type: parentData.attendee_type,
          registered_by: parentData.registered_by,
        },
      ]);

    // Handle any errors while inserting the history record
    if (insertHistoryError) {
      throw new Error(insertHistoryError.message);
    }
  }

  return data;
};

// Parishioner insert children
export const insertChildren = async (childData) => {
  // Insert or update the child's attendance data in the attendance table
  const { data, error } = await supabase
    .from("attendance")
    .upsert([
      {
        attendee_id: childData.id,
        event_id: childData.event_id,
        attendee_type: childData.attendee_type,
        attended: childData.attended,
        main_applicant: childData.main_applicant,
        first_name: childData.first_name,
        last_name: childData.last_name,
        family_id: childData.family_id,
        registration_code: childData.registration_code,
        registered_by: childData.registered_by,
      },
    ])
    .select();

  // If there's an error inserting the attendance data, throw an error
  if (error) throw new Error(error.message);

  // Fetch event data to get event name and other event-related details
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", childData.event_id)
    .single();

  // Handle any errors when fetching the event data
  if (eventError) {
    console.error("Error fetching event data:", eventError.message);
    throw new Error(`Error fetching event data: ${eventError.message}`);
  }

  // Check if this child has attended this event before
  const { data: existingHistoryAttendees } = await supabase
    .from("previous_attendees")
    .select("first_name, last_name")
    .eq("event_name", eventData.event_name)
    .eq("first_name", childData.first_name)
    .eq("last_name", childData.last_name)
    .single();

  // If no previous attendance record is found, insert a new history record
  if (!existingHistoryAttendees) {
    const { error: insertHistoryError } = await supabase
      .from("previous_attendees")
      .insert([
        {
          first_name: childData.first_name,
          last_name: childData.last_name,
          event_name: eventData.event_name,
          family_type: childData.attendee_type,
          registered_by: childData.registered_by,
        },
      ]);

    // Handle any errors while inserting the history record
    if (insertHistoryError) {
      throw new Error(insertHistoryError.message);
    }
  }

  return data;
};

const fetchAttendeesByTicketCode = async (registrationCode) => {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        *,
        events:events (
          id,
          event_name,
          event_date,
          event_time
        )
      `
      )
      .eq("registration_code", registrationCode);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      // Separate parents and children based on `attendee_type`
      const parents = data
        .filter((item) => item.attendee_type === "parents")
        .map((parent) => ({
          id: parent.id,
          firstName: parent.first_name,
          lastName: parent.last_name,
          contactNumber: parent.contact_number,
          isMainApplicant: parent.main_applicant,
        }));

      const children = data
        .filter((item) => item.attendee_type === "children")
        .map((child) => ({
          id: child.id,
          firstName: child.first_name,
          lastName: child.last_name,
        }));

      // Extract event information from the first record (assuming all entries belong to the same event)
      const event = data[0].events;
      const registrationCode = data[0].registration_code;

      // Assuming all attendees have the same family_id for the given registration code
      const familyId = data[0].family_id;

      const transformedData = {
        registrationCode,
        familyId, // Add familyId to the top level of the response
        event: {
          id: event.id,
          name: event.event_name,
        },
        parents,
        children,
      };

      return { success: true, data: transformedData };
    } else {
      return {
        success: false,
        message: "No attendees found for this ticket code.",
      };
    }
  } catch (error) {
    console.error("Error fetching attendees and event:", error.message);
    return { success: false, error: error.message };
  }
};

const updateAttendeeStatus = async (attendeeID, state) => {
  try {
    const update = {
      attended: state,
      time_attended: state === true ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("attendance")
      .update(update)
      .eq("id", attendeeID)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const updateTimeOut = async (attendeeID) => {
  try {
    const time_out = new Date().toISOString();

    const { data, error } = await supabase
      .from("attendance")
      .update({ time_out })
      .eq("id", attendeeID)
      .select()
      .single();

    if (error) {
      console.error(error);
      throw new Error(error);
    }

    return data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const countEventAttendance = async (eventId) => {
  try {
    const { count: totalCount, error } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    if (error) {
      console.error(error);
      throw new Error(error.message);
    }

    // Count rows with attended set to true for the same event_id
    const { count: attendedCount, error: attendedError } = await supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("attended", true);

    if (attendedError) {
      console.error(attendedError);
      throw new Error(attendedError.message);
    }

    return { total: totalCount, attended: attendedCount };
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
// Function to submit add new record in schedule
const insertNewRecord = async (submittedData) => {
  const { event, parents, children, registered_by } = submittedData;

  const familyId = uuidv4();
  const mainApplicant = parents.find((parent) => parent.isMainApplicant);

  const parentRecords = parents.map((parent) => ({
    first_name: parent.parentFirstName,
    last_name: parent.parentLastName,
    contact_number: parent.parentContactNumber,
    main_applicant:
      mainApplicant &&
      parent.parentFirstName === mainApplicant.parentFirstName &&
      parent.parentLastName === mainApplicant.parentLastName,
    type: "parents",
    family_id: familyId,
  }));

  const childrenRecords = children.map((child) => ({
    first_name: child.childFirstName,
    last_name: child.childLastName,
    type: "children",
    main_applicant: false,
    family_id: familyId,
  }));

  const attendeesData = [...parentRecords, ...childrenRecords];

  // Check existence of each attendee before inserting
  const existenceChecks = attendeesData.map(async (attendee) => {
    const { data: checkExistence, error: checkError } = await supabase
      .from("attendance")
      .select("first_name, last_name")
      .eq("first_name", attendee.first_name)
      .eq("last_name", attendee.last_name)
      .eq("event_id", event);

    if (checkError) {
      throw new Error(
        `Error checking user registration: ${checkError.message}`
      );
    }

    if (checkExistence[0]) {
      throw new Error(
        `${checkExistence[0].first_name} ${checkExistence[0].last_name} is already registered for this event.`
      );
    }
  });

  try {
    await Promise.all(existenceChecks);
  } catch (error) {
    throw new Error(error.message);
  }

  // Insert only if all checks pass
  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance")
    .insert(
      attendeesData.map((attendee) => ({
        event_id: event,
        attendee_type: attendee.type,
        main_applicant:
          attendee.type === "parents" ? attendee.main_applicant : false,
        first_name: attendee.first_name,
        last_name: attendee.last_name,
        time_attended: new Date().toISOString(),
        attended: true,
        contact_number: attendee.contact_number || null,
        family_id: attendee.family_id,
        registration_code: attendee.registration_code || null,
        registered_by,
      }))
    );

  if (attendanceError) {
    return { success: false, error: attendanceError.message };
  }

  return { success: true, attendanceData };
};

const editAttendee = async ({
  update_id,
  first_name,
  last_name,
  time_attended,
  time_out,
  contact_number,
  attendeeId,
}) => {
  const convertToISOString = (time) => {
    //extract hours and minutes
    const [hours, minutes] = time.split(":");

    // Create a Date object (use the current date as a reference)
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    // Return the ISO string representation
    return date.toISOString();
  };

  const { error } = await supabase
    .from("attendance")
    .update({
      first_name,
      last_name,
      time_attended: time_attended ? convertToISOString(time_attended) : null,
      time_out: time_out ? convertToISOString(time_out) : null,
      contact_number: contact_number ?? null,
    })
    .select("id")
    .eq("id", attendeeId);

  if (error) {
    throw new Error(error.message);
  }

  const { error: addError } = await supabase
    .from("attendance_update_logs")
    .insert([
      {
        attendance_id: attendeeId,
        updatedby_id: update_id,
        first_name,
        last_name,
        updated_at: new Date(),
        contact_number: contact_number ?? null,
      },
    ]);

  if (addError) {
    throw new Error("failed Adding to edit logs!", addError.message);
  }
};

const fetchAttendanceEditLogs = async ({ attendance_id, family_id }) => {
  const query = supabase
    .from("attendance_update_logs")
    .select("*, users(first_name,last_name)")
    .order("updated_at", { ascending: false });

  if (attendance_id) {
    query.eq("attendance_id", attendance_id);
  } else if (family_id) {
    query.eq("family_id", family_id);
  } else {
    throw new Error("Either attendance_id or family_id must be provided.");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Failed fetching update logs.", error.message);
  }

  return data;
};

const addSingleAttendee = async ({
  attendeeData,
  family_id,
  editedby_id,
  attendee_type,
  event_id,
}) => {
  const { data: checkExistence, error: checkError } = await supabase
    .from("attendance")
    .select("first_name, last_name")
    .eq("first_name", attendeeData.first_name)
    .eq("last_name", attendeeData.last_name)
    .eq("event_id", event_id);

  if (checkError) {
    throw new Error(`Error checking user registration: ${checkError.message}`);
  }

  if (checkExistence[0]) {
    throw new Error(
      `${checkExistence[0].first_name} ${checkExistence[0].last_name} is already registered for this event.`
    );
  }

  const { data, error } = await supabase
    .from("attendance")
    .insert([{ ...attendeeData, family_id, attendee_type, event_id }])
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    const { error: addLogError } = await supabase
      .from("attendance_update_logs")
      .insert([
        {
          // attendance_id: data.id,
          updatedby_id: editedby_id,
          first_name: attendeeData.first_name,
          last_name: attendeeData.last_name,
          updated_at: new Date(),
          family_id,
          contact_number: attendeeData.contact_number ?? null,
        },
      ]);

    if (addLogError) {
      console.error(addLogError.message);
      throw new Error("failed Adding to edit logs!", addLogError.message);
    }
  }
};

const fetchAlreadyRegistered = async (eventId, attendeeIds) => {
  const { data, error } = await supabase
    .from("attendance")
    .select("attendee_id, first_name, last_name, attendee_type")
    .order("first_name", { ascending: true })
    .order("last_name", { ascending: true })
    .eq("event_id", eventId)
    .in("attendee_id", attendeeIds);
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const removeAttendee = async (attendeeId) => {
  const { data, error } = await supabase
    .from("attendance")
    .delete()
    .eq("attendee_id", attendeeId);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const fetchParentAttendanceHistory = async (event_name) => {
  const { data, error } = await supabase
    .from("previous_attendees")
    .select("*")
    .eq("family_type", "parents")
    .eq("event_name", event_name);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
const fetchChildrenAttendanceHistory = async (event_name) => {
  const { data, error } = await supabase
    .from("previous_attendees")
    .select("*")
    .eq("family_type", "children")
    .eq("event_name", event_name);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const searchAttendee = async ({ searchTerm = "", page = 1, pageSize = 10 }) => {
  // Initial data retrieval when no search term is provided
  if (!searchTerm || searchTerm.trim() === "") {
    try {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      const [parentsResult, childrenResult, walkInResult] = await Promise.all([
        supabase
          .from("parents")
          .select("id, first_name, last_name, family_id, contact_number")
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(start, end),
        supabase
          .from("children")
          .select("id, first_name, last_name, family_id")
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(start, end),
        supabase
          .from("attendance")
          .select(
            "id, first_name, last_name, family_id, contact_number, attendee_type, event_id"
          )
          .is("attendee_id", null)
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(start, end),
      ]);

      // Check for any errors in the queries
      if (parentsResult.error || childrenResult.error || walkInResult.error) {
        throw parentsResult.error || childrenResult.error || walkInResult.error;
      }

      // Create a map to track existing names to avoid duplicates
      const existingNames = new Set();

      // Add parents to the set of existing names
      const parentsWithType = parentsResult.data.map((item) => {
        const nameKey = `${item.first_name.toLowerCase()}_${item.last_name.toLowerCase()}`;
        existingNames.add(nameKey);
        return {
          ...item,
          type: "parent",
        };
      });

      // Add children to the set of existing names
      const childrenWithType = childrenResult.data.map((item) => {
        const nameKey = `${item.first_name.toLowerCase()}_${item.last_name.toLowerCase()}`;
        existingNames.add(nameKey);
        return {
          ...item,
          type: "child",
        };
      });

      // Filter walk-ins to only include those with unique names
      const walkInsWithType = walkInResult.data
        .filter((item) => {
          const nameKey = `${item.first_name.toLowerCase()}_${item.last_name.toLowerCase()}`;
          return !existingNames.has(nameKey);
        })
        .map((item) => ({
          ...item,
          type: "walkIn",
        }));

      // Combine and sort the results
      const allItems = [
        ...parentsWithType,
        ...childrenWithType,
        ...walkInsWithType,
      ];
      allItems.sort((a, b) => {
        const firstNameCompare = a.first_name.localeCompare(b.first_name);
        return firstNameCompare === 0
          ? a.last_name.localeCompare(b.last_name)
          : firstNameCompare;
      });

      // Get total counts
      const [parentCount, childCount, walkInCount] = await Promise.all([
        supabase.from("parents").select("id", { count: "exact" }),
        supabase.from("children").select("id", { count: "exact" }),
        supabase
          .from("attendance")
          .select("id", { count: "exact", filters: "attendee_id.is.null" }),
      ]);

      return {
        parents: parentsWithType,
        children: childrenWithType,
        walkInAttendees: walkInsWithType,
        totalParents: parentCount.count || 0,
        totalChildren: childCount.count || 0,
        totalWalkIns: walkInCount.count || 0,
        totalItems:
          parentCount.count +
          childCount.count +
          walkInResult.data.length -
          (walkInResult.data.length - walkInsWithType.length),
        page,
        hasMore:
          parentCount.count +
            childCount.count +
            (walkInCount.count -
              (walkInResult.data.length - walkInsWithType.length)) >
          page * pageSize,
      };
    } catch (error) {
      console.error("Error in initial data retrieval:", error);
      return {
        parents: [],
        children: [],
        walkInAttendees: [],
        totalParents: 0,
        totalChildren: 0,
        totalWalkIns: 0,
        totalItems: 0,
        page,
        hasMore: false,
      };
    }
  }

  // Search logic for when a search term is provided
  try {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // Normalize search term to handle multiple word searches
    const searchTerms = searchTerm.trim().split(/\s+/);

    // Helper function to check if all search terms match
    const matchesAllTerms = (item, terms) => {
      return terms.every(
        (term) =>
          item.first_name.toLowerCase().includes(term.toLowerCase()) ||
          item.last_name.toLowerCase().includes(term.toLowerCase())
      );
    };

    // Fetch data for all tables
    const [parentsResult, childrenResult, walkInResult] = await Promise.all([
      supabase
        .from("parents")
        .select("id, first_name, last_name, family_id, contact_number")
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true }),
      supabase
        .from("children")
        .select("id, first_name, last_name, family_id")
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true }),
      supabase
        .from("attendance")
        .select(
          "id, first_name, last_name, family_id, contact_number, attendee_type, event_id"
        )
        .is("attendee_id", null)
        .order("first_name", { ascending: true })
        .order("last_name", { ascending: true }),
    ]);

    // Check for any errors in the queries
    if (parentsResult.error || childrenResult.error || walkInResult.error) {
      throw parentsResult.error || childrenResult.error || walkInResult.error;
    }

    // Filter results based on search terms
    const filteredParents = parentsResult.data
      .filter((parent) => matchesAllTerms(parent, searchTerms))
      .map((item) => ({ ...item, type: "parent" }));

    const filteredChildren = childrenResult.data
      .filter((child) => matchesAllTerms(child, searchTerms))
      .map((item) => ({ ...item, type: "child" }));

    // Create a map to track existing names to avoid duplicates
    const existingNames = new Set([
      ...filteredParents.map(
        (p) => `${p.first_name.toLowerCase()}_${p.last_name.toLowerCase()}`
      ),
      ...filteredChildren.map(
        (c) => `${c.first_name.toLowerCase()}_${c.last_name.toLowerCase()}`
      ),
    ]);

    // Filter and sort walk-in attendees without duplicates
    const filteredWalkIns = walkInResult.data
      .filter((walkIn) => {
        const nameKey = `${walkIn.first_name.toLowerCase()}_${walkIn.last_name.toLowerCase()}`;
        return (
          matchesAllTerms(walkIn, searchTerms) && !existingNames.has(nameKey)
        );
      })
      .map((item) => ({ ...item, type: "walkIn" }))
      .sort((a, b) => {
        const firstNameCompare = a.first_name.localeCompare(b.first_name);
        return firstNameCompare === 0
          ? a.last_name.localeCompare(b.last_name)
          : firstNameCompare;
      });

    // Combine all filtered items
    const allItems = [
      ...filteredParents,
      ...filteredChildren,
      ...filteredWalkIns,
    ];

    // Sort the combined array
    allItems.sort((a, b) => {
      const firstNameCompare = a.first_name.localeCompare(b.first_name);
      return firstNameCompare === 0
        ? a.last_name.localeCompare(b.last_name)
        : firstNameCompare;
    });

    // Apply pagination to the combined array
    const paginatedItems = allItems.slice(start, end + 1);

    // Separate the paginated items back into their respective categories
    const paginatedParents = paginatedItems.filter(
      (item) => item.type === "parent"
    );

    const paginatedChildren = paginatedItems.filter(
      (item) => item.type === "child"
    );

    const paginatedWalkIns = paginatedItems.filter(
      (item) => item.type === "walkIn"
    );

    // Determine if there are more items to fetch
    const hasMore = allItems.length > page * pageSize;

    return {
      parents: paginatedParents,
      children: paginatedChildren,
      walkInAttendees: paginatedWalkIns,
      totalParents: filteredParents.length,
      totalChildren: filteredChildren.length,
      totalWalkIns: filteredWalkIns.length,
      totalItems: allItems.length,
      page,
      hasMore,
    };
  } catch (error) {
    console.error("Error in searchAttendee:", error);
    return {
      parents: [],
      children: [],
      walkInAttendees: [],
      totalParents: 0,
      totalChildren: 0,
      totalWalkIns: 0,
      totalItems: 0,
      page,
      hasMore: false,
    };
  }
};

// const searchAttendee = async ({ searchTerm, page = 1, pageSize = 10 }) => {
//   try {
//     const start = (page - 1) * pageSize;
//     const end = start + pageSize - 1;

//     // Search for matching parents, children, and walk-in attendees
//     const [parentsResult, childrenResult, walkInResult] = await Promise.all([
//       supabase
//         .from("parents")
//         .select("first_name, last_name, family_id")
//         .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
//         .order("first_name", { ascending: true })
//         .order("last_name", { ascending: true }),
//       supabase
//         .from("children")
//         .select("first_name, last_name, family_id")
//         .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
//         .order("first_name", { ascending: true })
//         .order("last_name", { ascending: true }),
//       supabase
//         .from("attendance")
//         .select(
//           "id, first_name, last_name, family_id, contact_number, attendee_type, event_id"
//         )
//         .is("attendee_id", null)
//         .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
//         .order("first_name", { ascending: true })
//         .order("last_name", { ascending: true }),
//     ]);

//     if (parentsResult.error || childrenResult.error || walkInResult.error) {
//       throw parentsResult.error || childrenResult.error || walkInResult.error;
//     }

//     // Get unique family IDs from parents and children
//     const familyIds = [
//       ...new Set([
//         ...parentsResult.data.map((parent) => parent.family_id),
//         ...childrenResult.data.map((child) => child.family_id),
//       ]),
//     ];

//     // Create a map to track existing names to avoid duplicates
//     const existingNames = new Set();

//     // Add family members' names to the set
//     parentsResult.data.forEach((p) =>
//       existingNames.add(
//         `${p.first_name.toLowerCase()}_${p.last_name.toLowerCase()}`
//       )
//     );
//     childrenResult.data.forEach((c) =>
//       existingNames.add(
//         `${c.first_name.toLowerCase()}_${c.last_name.toLowerCase()}`
//       )
//     );

//     // Filter walk-in attendees to remove duplicates
//     const uniqueWalkIns = Array.from(
//       walkInResult.data.reduce((map, w) => {
//         const nameKey = `${w.first_name.toLowerCase()}_${w.last_name.toLowerCase()}`;
//         if (!existingNames.has(nameKey) && !map.has(nameKey)) {
//           map.set(nameKey, w);
//         }
//         return map;
//       }, new Map())
//     )
//       .map(([_, walkIn]) => walkIn)
//       .sort((a, b) => {
//         // Sort by first name first
//         const firstNameCompare = a.first_name.localeCompare(b.first_name);
//         // If first names are equal, sort by last name
//         return firstNameCompare === 0
//           ? a.last_name.localeCompare(b.last_name)
//           : firstNameCompare;
//       });

//     if (!familyIds.length && !uniqueWalkIns.length) {
//       return {
//         families: [],
//         walkInAttendees: [],
//         hasMore: false,
//         page,
//         total: 0,
//       };
//     }

//     // Fetch family groups if there are any family IDs
//     let familyGroups = [];
//     let count = 0;

//     if (familyIds.length > 0) {
//       const familyResult = await supabase
//         .from("family_group")
//         .select("*", { count: "exact" })
//         .in("id", familyIds);

//       if (familyResult.error) throw familyResult.error;
//       familyGroups = familyResult.data;
//       count = familyResult.count;
//     }

//     // Fetch all parents and children for these family groups
//     const [parents, children] = await Promise.all([
//       familyGroups.length > 0
//         ? supabase
//             .from("parents")
//             .select("*")
//             .in(
//               "family_id",
//               familyGroups.map((fg) => fg.id)
//             )
//         : { data: [] },
//       familyGroups.length > 0
//         ? supabase
//             .from("children")
//             .select("*")
//             .in(
//               "family_id",
//               familyGroups.map((fg) => fg.id)
//             )
//         : { data: [] },
//     ]);

//     // Group by family_id
//     const families = familyGroups
//       .map((fg) => ({
//         familyId: fg.id,
//         parents:
//           parents.data
//             ?.filter((p) => p.family_id === fg.id)
//             .sort((a, b) => a.first_name.localeCompare(b.first_name)) || [],
//         children:
//           children.data
//             ?.filter((c) => c.family_id === fg.id)
//             .sort((a, b) => a.first_name.localeCompare(b.first_name)) || [],
//       }))
//       .sort((a, b) => {
//         const aName = a.parents[0]?.last_name || "";
//         const bName = b.parents[0]?.last_name || "";
//         return aName.localeCompare(bName);
//       });

//     // Calculate total items and handle pagination in memory
//     const totalItems = families.length + uniqueWalkIns.length;

//     // Paginate both families and walk-ins
//     const paginatedFamilies = families.slice(start, end + 1);
//     const paginatedWalkIns = uniqueWalkIns.slice(
//       Math.max(0, start - families.length),
//       Math.max(0, end + 1 - families.length)
//     );
//     return {
//       families: paginatedFamilies,
//       walkInAttendees: paginatedWalkIns,
//       hasMore: page * pageSize < count + uniqueWalkIns.length,
//       page,
//       total: totalItems,
//     };
//   } catch (error) {
//     console.error("Error in searchAttendee:", error);
//     return {
//       families: [],
//       walkInAttendees: [],
//       hasMore: false,
//       page,
//       total: 0,
//     };
//   }
// };
const getAttendee = async (eventId) => {
  try {
    // Fetch attendance records
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("event_id", eventId);

    if (attendanceError) throw attendanceError;

    // Extract attendee IDs and filter out null or undefined values
    const attendeeIds = attendanceData
      ?.map((a) => a.attendee_id)
      .filter((id) => id !== null && id !== undefined);

    if (attendeeIds.length === 0) return [];

    // Fetch parents and children only if there are valid attendee IDs
    const [parentData, childData] = await Promise.all([
      supabase.from("parents").select("*").in("id", attendeeIds),
      supabase.from("children").select("*").in("id", attendeeIds),
    ]);

    // Map attendance with details
    return attendanceData.map((attendance) => {
      const isParent = parentData.data?.find(
        (p) => p.id === attendance.attendee_id
      );
      return {
        ...attendance,
        attendee:
          isParent ||
          childData.data?.find((c) => c.id === attendance.attendee_id),
        type: isParent ? "parent" : "child",
      };
    });
  } catch (error) {
    console.error("Error in getAttendee:", error);
    throw error;
  }
};

const removeAttendeeFromRecord = async (attendeeId, eventId) => {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .delete()
      .eq("attendee_id", attendeeId)
      .eq("event_id", eventId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in removeAttendee:", error);
    throw new Error(error.message || "Failed to remove attendee");
  }
};

const addSingleAttendeeFromRecord = async (attendeeDetails) => {
  try {
    // First check if an attendee with the same name exists in this event
    const { data: existingAttendee, error: checkError } = await supabase
      .from("attendance")
      .select("*")
      .eq("event_id", attendeeDetails.event.id)
      .eq("first_name", attendeeDetails.attendee.first_name)
      .eq("last_name", attendeeDetails.attendee.last_name)
      .maybeSingle();

    if (checkError) throw checkError;

    // If attendee already exists, throw error
    if (existingAttendee) {
      throw new Error(
        `Attendee ${attendeeDetails.attendee.first_name} ${attendeeDetails.attendee.last_name} is already registered for this event.`
      );
    }

    const { data, error } = await supabase
      .from("attendance")
      .insert([
        {
          attendee_id: attendeeDetails.attendee.id,
          first_name: attendeeDetails.attendee.first_name,
          last_name: attendeeDetails.attendee.last_name,
          event_id: attendeeDetails.event.id,
          family_id: attendeeDetails.family.id,
          contact_number: attendeeDetails.attendee.contact,
          attendee_type: attendeeDetails.attendee.type,
          attended: attendeeDetails.attended,
          time_attended: attendeeDetails.time_attended,
          registered_by: attendeeDetails.registered_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in addSingleAttendee:", error);
    throw error;
  }
};

const updateAttendee = async (attendeeId, eventId, state) => {
  try {
    // Validate parameters
    if (!attendeeId || !eventId) {
      throw new Error("Missing required parameters");
    }

    const update = {
      attended: state,
      time_attended: state ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("attendance")
      .update(update)
      .match({
        attendee_id: attendeeId,
        event_id: eventId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateAttendee:", error);
    throw new Error(error.message || "Failed to update attendance");
  }
};

const addSingleWalkInAttendeeFromRecord = async (attendeeDetails) => {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .insert([
        {
          first_name: attendeeDetails.attendee.first_name,
          last_name: attendeeDetails.attendee.last_name,
          event_id: attendeeDetails.event.id,
          family_id: attendeeDetails.family.id,
          contact_number: attendeeDetails.attendee.contact,
          attendee_type: attendeeDetails.attendee.type,
          attended: attendeeDetails.attended,
          time_attended: attendeeDetails.time_attended,
          registered_by: attendeeDetails.registered_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error in addSingleAttendee:", error);
    throw error;
  }
};

const removeWalkInAttendeeFromRecord = async (
  first_name,
  last_name,
  eventId
) => {
  try {
    const { data, error } = await supabase
      .from("attendance")
      .delete()
      .eq("first_name,", first_name)
      .eq("last_name", last_name)
      .eq("event_id", eventId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in remove Attendee:", error);
    throw new Error(error.message || "Failed to remove attendee");
  }
};
const updateWalkInAttendee = async (first_name, last_name, eventId, state) => {
  try {
    // Validate parameters
    if (!first_name || !last_name || !eventId) {
      throw new Error("Missing required parameters");
    }

    const update = {
      attended: state,
      time_attended: state ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from("attendance")
      .update(update)
      .match({
        first_name,
        last_name,
        event_id: eventId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateAttendee:", error);
    throw new Error(error.message || "Failed to update attendance");
  }
};

const getAttendanceFromExistingRecord = async (eventId) => {
  try {
    // Fetch attendance records
    const { data: attendanceData, error: attendanceError } = await supabase
      .from("attendance")
      .select("*")
      .eq("event_id", eventId);

    if (attendanceError) throw attendanceError;

    return attendanceData;
  } catch (error) {
    console.error("Error in getAttendee:", error);
    throw error;
  }
};

export {
  fetchChildrenAttendanceHistory,
  fetchParentAttendanceHistory,
  editAttendee,
  getEventAttendance,
  fetchAttendeesByTicketCode,
  insertEventAttendance,
  updateAttendeeStatus,
  countEventAttendance,
  insertNewRecord,
  addSingleAttendee,
  fetchAttendanceEditLogs,
  fetchAlreadyRegistered,
  removeAttendee,
  searchAttendee,
  getAttendee,
  updateAttendee,
  removeAttendeeFromRecord,
  addSingleAttendeeFromRecord,
  addSingleWalkInAttendeeFromRecord,
  removeWalkInAttendeeFromRecord,
  updateWalkInAttendee,
  getAttendanceFromExistingRecord,
};
