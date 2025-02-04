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
      const { family_id, attendee_type } = record;

      // Find or create a family group
      let familyGroup = acc.find((group) => group.family_id === family_id);
      if (!familyGroup) {
        familyGroup = {
          family_id,
          family_surname: record.last_name || "Unknown",
          parents: [],
          children: [],
          registered_by: record.registered_by,
        };
        acc.push(familyGroup);
      }
      // Categorize attendees by type
      if (attendee_type === "parents") {
        familyGroup.parents.push(record);
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
  const { data: existingHistoryAttendees } =
    await supabase
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
  const { data: existingHistoryAttendees } =
    await supabase
      .from("previous_attendees")
      .select("first_name, last_name")
      .eq("event_name", eventData.event_name)
      .eq("first_name", childData.first_name)
      .eq("last_name", childData.last_name)
      .single();

  // If no previous attendance record is found, insert a new history record
  if (!existingHistoryAttendees) {
    console.log("adding to history")
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
  // get main applicant parent.
  const mainApplicant = parents.find((parent) => parent.isMainApplicant);

  // Prepare parent records with ticket_code
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
          attendee.type === "parents" ? attendee.main_applicant : false,
        first_name: attendee.first_name,
        last_name: attendee.last_name,
        contact_number: attendee.contact_number,
        family_id: attendee.family_id,
        registration_code: attendee.registration_code,
        registered_by,
      }))
    );

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", event)
    .single();

  if (eventError) {
    console.error("Error fetching event data:", eventError.message);
    throw new Error(`Error fetching event data:   ${eventError.message}`);
  }

  // Generate filter conditions for existing attendees check
  const orConditions = attendeesData
    .map(
      (attendee) =>
        `and(event_name.eq.${eventData.event_name},first_name.eq.${attendee.first_name},last_name.eq.${attendee.last_name})`
    )
    .join(",");
  // Check for existing matches using event_id, first_name, and last_name
  const { data: existingAttendees, error: existingError } = await supabase
    .from("previous_attendees")
    .select("first_name, last_name")
    .or(orConditions);

  if (existingError) {
    console.error("Error checking existing attendees:", existingError);
    return;
  }

  // Create unique key combining first_name and last_name
  const existingKeys = new Set(
    existingAttendees.map(
      (attendee) => `${attendee.first_name}:${attendee.last_name}`
    )
  );

  // Filter out any matching entries
  const newAttendeesData = attendeesData.filter(
    (attendee) =>
      !existingKeys.has(`${attendee.first_name}:${attendee.last_name}`)
  );

  // Insert remaining entries
  if (newAttendeesData.length > 0) {
    const { error: insertError } = await supabase
      .from("previous_attendees")
      .insert(
        newAttendeesData.map((attendee) => ({
          event_name: eventData.event_name,
          family_type: attendee.type,
          first_name: attendee.first_name,
          last_name: attendee.last_name,
          registered_by,
        }))
      );

    if (insertError) {
      console.error("Error inserting new attendees:", insertError);
    }

    if (attendanceError) {
      console.error(
        "Error inserting attendance records:",
        attendanceError.message
      );
      return { success: false, error: attendanceError };
    }
    return { success: true, attendanceData };
  }
};

const editAttendee = async ({
  update_id,
  first_name,
  last_name,
  contact_number,
  attendeeId,
}) => {
  const { error } = await supabase
    .from("attendance")
    .update({
      first_name,
      last_name,
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
  // console.log("backend",attendeeData,family_id, editedby_id)

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
};
