import { supabase } from "./supabaseClient";

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
const { count: familyMembersTotalCount, error: familyMembersError } =
  await supabase.from("parents").select("*", { count: "exact", head: true });

if (familyMembersError) {
  throw `Error fetching family members count: ${familyMembersError.message}`;
}

const getTotalConsultations = async () => {
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
    if (!item.family_group || !item.family_group.parents) {
      familyResponseCount += 1;
    } else {
      familyResponseCount += item.family_group.parents.length;
    }
    const familyMembersCount = item.family_group?.parents?.length || 1;
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
    noResponseCount;

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
    (noResponseCount / totalConsultationPoints) * 100
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
