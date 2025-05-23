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

// const getTotalConsultations = async (userId) => {
//   try {
//     const { data: familyId, error: familyIdError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(id)");

//     if (familyIdError) throw familyIdError.message;

//     let totalConsultations = 0;

//     familyId.map((family) => {
//       if (family.family_group) {
//         totalConsultations += family.family_group.parents.length;
//       }
//     });

//     // Count for preference_a = 1
//     const { data: Preference1A, error: totalPreference1AError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_a", 1);

//     if (totalPreference1AError) throw totalPreference1AError.message;

//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference1A = consultationsWithParents.reduce(
//       (total, consultation) => {
//         const parentsCount = consultation.family_group?.parents?.length || 0;
//         return total + parentsCount;
//       },
//       0
//     );
//     // Count for preference_a = 2
//     const { data: Preference2A, error: totalPreference2AError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_a", 2);
//     if (totalPreference2AError) throw Preference2A.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference2A = Preference2A.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_a = 3
//     const { data: Preference3A, error: totalPreference3AError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_a", 3);
//     if (totalPreference3AError) throw totalPreference3AError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference3A = Preference3A.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_b = 1
//     const { data: Preference1B, error: totalPreference1BError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_b", 1);

//     if (totalPreference1BError) throw totalPreference1BError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference1B = Preference1B.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_b = 2
//     const { data: Preference2B, error: totalPreference2BError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_b", 2);
//     if (totalPreference2BError) throw totalPreference2BError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference2B = Preference2B.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_b = 3
//     const { data: Preference3B, error: totalPreference3BError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_b", 3);
//     if (totalPreference3BError) throw totalPreference3BError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference3B = Preference3B.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_c = 1
//     const { data: Preference1C, error: totalPreference1CError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_c", 1);
//     if (totalPreference1CError) throw totalPreference1CError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference1C = Preference1C.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_c = 2
//     const { data: Preference2C, error: totalPreference2CError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_c", 2);
//     if (totalPreference2CError) throw totalPreference2CError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference2C = Preference2C.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for preference_c = 3
//     const { data: Preference3C, error: totalPreference3CError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("preference_c", 3);
//     if (totalPreference3CError) throw totalPreference3CError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const totalPreference3C = Preference3C.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     // Count for mass = 6pm
//     const { data: mass6pm, error: total6pmMassError } = await supabase
//       .from("consultations")
//       .select("*, family_group:family_id(id, parents:parents(*))")
//       .eq("mass_time", "6pm");
//     if (total6pmMassError) throw total6pmMassError.message;
//     // Calculate total by counting parents in each consultation's family group
//     const total6pmMass = mass6pm.reduce((total, consultation) => {
//       const parentsCount = consultation.family_group?.parents?.length || 0;
//       return total + parentsCount;
//     }, 0);
//     return {
//       totalConsultations,
//       totalPreference1A,
//       totalPreference1B,
//       totalPreference1C,
//       totalPreference2A,
//       totalPreference2B,
//       totalPreference2C,
//       totalPreference3A,
//       totalPreference3B,
//       totalPreference3C,
//       total6pmMass,
//       total8amMass,
//       total930amMass,
//       total11amMass,
//       highestMassPreference,
//       highestMassName,
//     };
//   } catch (error) {
//     console.error("Error fetching consultations:", error);
//     throw error;
//   }
// };

export { addConsultation, checkConsultationExistence };
