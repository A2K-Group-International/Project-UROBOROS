import { supabase } from "./supabaseClient";

export const handleWalkInData = async ({
  eventId,
  ticketCode, // The ticketCode passed in the function parameters
  parents,
  children,
}) => {
  try {
    // Ensure all parents and children have family_id, if not already included
    const familyId = parents[0]?.family_id || children[0]?.family_id;

    if (!familyId) {
      console.error(
        "Family ID is missing in both parents and children records."
      );
      throw new Error("Family ID is required.");
    }

    // Delete all records for the given ticket code
    const { error: deleteError } = await supabase
      .from("attendance")
      .delete()
      .eq("registration_code", ticketCode); // Delete by ticketCode

    if (deleteError) {
      console.error("Error deleting existing records:", deleteError);
      throw deleteError;
    }

    // Prepare parent records with registration_code and family_id
    const parentRecords = parents.map((parent) => ({
      event_id: eventId,
      registration_code: ticketCode,
      first_name: parent.first_name,
      last_name: parent.last_name,
      mobile_number: parent.mobile_number,
      attendee_type: "parents",
      main_applicant: parent.main_applicant,
      family_id: parent.family_id || familyId, // Use family_id from the parent data if it exists, otherwise fallback to extracted familyId
    }));

    // Log the prepared parent records

    // Prepare child records with registration_code and family_id
    const childRecords = children.map((child) => ({
      event_id: eventId,
      registration_code: ticketCode,
      first_name: child.first_name,
      last_name: child.last_name,
      attendee_type: "children",
      main_applicant: child.main_applicant,
      family_id: child.family_id || familyId, // Use family_id from the child data if it exists, otherwise fallback to extracted familyId
    }));

    // Combine all records to insert
    const allRecords = [...parentRecords, ...childRecords];

    // Insert all new records
    const { error: insertError } = await supabase
      .from("attendance")
      .insert(allRecords);

    if (insertError) {
      console.error("Error inserting new records:", insertError);
      throw insertError;
    }
  } catch (error) {
    console.error("Error handling walk-in data:", error);
    throw error;
  }
};
