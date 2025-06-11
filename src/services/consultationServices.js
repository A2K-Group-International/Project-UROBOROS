import { supabase } from "./supabaseClient";

/**
 * Checks if a consultation exists for a user by their ID.
 * @param {string} userId - The ID of the user to check.
 * @returns {Promise<Object>} An object containing the user's family ID and consultation existence status.
 * @throws {Error} If the user ID is not provided or if there is an error fetching the family ID or consultation.
 * * @example
 *
 * */
const checkConsultationExistence = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const { data: userFamilyId, error: familyIdError } = await supabase
    .from("parents")
    .select("family_id")
    .eq("parishioner_id", userId)
    .single();

  if (familyIdError) throw `Error fetching family ID: ${familyIdError.message}`;

  const { data: consultationExist, error } = await supabase
    .from("consultations")
    .select("*, users:users(first_name, last_name)")
    .eq("family_id", userFamilyId.family_id)
    .maybeSingle();

  if (error) throw `Error fetching consultation: ${error.message}`;
  return { userFamilyId, consultationExist };
};

/**
 *
 * Adds a consultation for a user if they haven't already submitted their preferences.
 * @param {Object} params - The parameters for the consultation.
 * @param {string} params.userId - The ID of the user submitting the consultation.
 * @param {Object} params.consultation - The consultation preferences.
 * @param {string} params.consultation.preferenceA - The first preference.
 * @param {string} params.consultation.preferenceB - The second preference.
 * @param {string} params.consultation.preferenceC - The third preference.
 * @param {string} params.consultation.massPreference - The mass preference.
 * @param {string} params.consultation.optionalReasons - Optional reasons for the consultation.
 * * @returns {Promise<Object>} A message indicating the consultation was added successfully.
 * @throws {Error} If the user has already submitted their preferences or if there is an error adding the consultation.
 * * @throws {Error} If there is an error checking for existing consultations or adding the new consultation.
 *
 */

const addConsultation = async ({ userId, consultation }) => {
  const { userFamilyId, consultationExist } =
    await checkConsultationExistence(userId);

  if (consultationExist) {
    throw new Error("You have already submitted your preferences.");
  }

  const payload = {
    id: userId,
    preference_a: consultation.preferenceA,
    preference_b: consultation.preferenceB,
    preference_c: consultation.preferenceC,
    preference_mass: consultation.massPreference,
    optional_reason: consultation.optionalReasons,
    family_id: userFamilyId.family_id,
    user_id: userId,
  };

  const { error } = await supabase
    .from("consultations")
    .insert([payload])
    .select();

  if (error) throw `Error adding consultation: ${error.message}`;

  return { message: "Consultation added successfully" };
};

/**
 *  Fetches total consultations and calculates points and percentages for each preference.
 * @returns {Object} An object containing the total points and percentages for each preference, as well as counts for mass preferences.
 */

/*

Point System:

1st Preference (Preference A): 3 points per family member.
2nd Preference (Preference B): 2 points per family member.
3rd Preference (Preference C): 1 point per family member.
No Response: 3 points per family member who did not submit a response.
Calculation Steps:

Calculate Points for Each Preference Category:

preference_a_points = (Number of family members choosing Preference A as 1st) * 3
preference_b_points = (Number of family members choosing Preference B as 2nd) * 2
preference_c_points = (Number of family members choosing Preference C as 3rd) * 1
Calculate Points for "No Response":

no_response_points = (Number of family members who did not respond) * 3
This assigns a weight to the "No Response" category, making it comparable to a 1st preference in terms of point contribution.
Calculate Total Consultation Points:

This is the sum of all points accumulated across all categories.
totalConsultationPoints = preference_a_points + preference_b_points + preference_c_points + no_response_points

Calculate Percentage for Each Category:

The percentage for each category (Preference A, B, C, and No Response) is its share of the totalConsultationPoints.
percentage_category = Math.round((points_for_category / totalConsultationPoints) * 100)
For example:
preference_a_percentage = Math.round((preference_a_points / totalConsultationPoints) * 100)
no_response_percentage = Math.round((no_response_points / totalConsultationPoints) * 100)
Interpretation of the "No Response" Slice:

The "No Response" slice in this pie chart represents the proportion of total points that are attributed to families who did not submit a preference, where each non-responding family contributes 3 points to the total. It does not directly represent the raw percentage of families who did not respond (e.g., if 25 out of 40 families didn't respond, the raw non-response rate is 62.5%, but the points-based slice in the pie chart will differ based on the total points from other preferences).

This method ensures that all slices of the pie chart are comparable in terms of their contribution to the overall point-based evaluation of preferences and sum up to 100% of the total points.
*/

const getTotalConsultations = async () => {
  const { count: familyMembersTotalCount, error: familyMembersError } =
    await supabase.from("parents").select("*", { count: "exact", head: true });

  if (familyMembersError) {
    throw `Error fetching family members count: ${familyMembersError.message}`;
  }
  const { data: preferences, error } = await supabase
    .from("consultations")
    .select("*,family_group:family_id(id, parents:parents(id))", {
      count: "exact",
    });

  if (error) throw `Error fetching total consultations: ${error.message}`;

  let preference_a_points = 0;
  let preference_b_points = 0;
  let preference_c_points = 0;

  let nineThirtyAMCount = 0;
  let elevenAMCount = 0;
  let sixPMCount = 0;
  let eightAMCount = 0;

  const getPreferencePoints = (preference, totalFamilyMembers) => {
    switch (preference) {
      case "1st":
        return 3 * totalFamilyMembers;
      case "2nd":
        return 2 * totalFamilyMembers;
      case "3rd":
        return 1 * totalFamilyMembers;
      default:
        return 0;
    }
  };

  let familyResponseCount = 0;
  preferences.map((item) => {
    if (!item.family_group || item.family_group.parents.length < 1) {
      familyResponseCount += 1;
    } else {
      familyResponseCount += item.family_group.parents.length;
    }
    const familyMembersCount =
      item.family_group?.parents?.length === 0
        ? 1
        : item.family_group.parents.length;
    preference_a_points += getPreferencePoints(
      item.preference_a,
      familyMembersCount
    );
    preference_b_points += getPreferencePoints(
      item.preference_b,
      familyMembersCount
    );
    preference_c_points += getPreferencePoints(
      item.preference_c,
      familyMembersCount
    );

    if (item.preference_mass === "9.30am") {
      nineThirtyAMCount += familyMembersCount;
    } else if (item.preference_mass === "11.00am") {
      elevenAMCount += familyMembersCount;
    } else if (item.preference_mass === "6.00pm; Saturday") {
      sixPMCount += familyMembersCount;
    } else if (item.preference_mass === "8.00am") {
      eightAMCount += familyMembersCount;
    }
  });

  const noResponseCount = familyMembersTotalCount - familyResponseCount;

  const totalConsultationPoints =
    preference_a_points +
    preference_b_points +
    preference_c_points +
    noResponseCount * 3;

  const preference_a_percentage = Math.round(
    (preference_a_points / totalConsultationPoints) * 100
  );
  const preference_b_percentage = Math.round(
    (preference_b_points / totalConsultationPoints) * 100
  );
  const preference_c_percentage = Math.round(
    (preference_c_points / totalConsultationPoints) * 100
  );
  const no_response_percentage = Math.round(
    ((noResponseCount * 3) / totalConsultationPoints) * 100
  );

  return {
    preference_a_points,
    preference_b_points,
    preference_c_points,
    preference_a_percentage,
    preference_b_percentage,
    preference_c_percentage,
    noResponseCount,
    nineThirtyAMCount,
    elevenAMCount,
    sixPMCount,
    eightAMCount,
    familyResponseCount,
    no_response_percentage,
  };
};

export { addConsultation, checkConsultationExistence, getTotalConsultations };
