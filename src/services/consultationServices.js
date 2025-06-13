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
    .maybeSingle();

  if (!userFamilyId) {
    throw new Error("User does not have a family ID associated.");
  }

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

// const getTotalConsultations = async () => {
//   const { count: familyMembersTotalCount, error: familyMembersError } =
//     await supabase.from("parents").select("*", { count: "exact", head: true });

//   if (familyMembersError) {
//     throw `Error fetching family members count: ${familyMembersError.message}`;
//   }
//   const { data: preferences, error } = await supabase
//     .from("consultations")
//     .select("*,family_group:family_id(id, parents:parents(id))", {
//       count: "exact",
//     });

//   if (error) throw `Error fetching total consultations: ${error.message}`;

//   let preference_a_points = 0;
//   let preference_b_points = 0;
//   let preference_c_points = 0;

//   let nineThirtyAMCount = 0;
//   let elevenAMCount = 0;
//   let sixPMCount = 0;
//   let eightAMCount = 0;

//   const getPreferencePoints = (preference, totalFamilyMembers) => {
//     switch (preference) {
//       case "1st":
//         return 3 * totalFamilyMembers;
//       case "2nd":
//         return 2 * totalFamilyMembers;
//       case "3rd":
//         return 1 * totalFamilyMembers;
//       default:
//         return 0;
//     }
//   };

//   let familyResponseCount = 0;
//   preferences.map((item) => {
//     if (!item.family_group || item.family_group.parents.length < 1) {
//       familyResponseCount += 1;
//     } else {
//       familyResponseCount += item.family_group.parents.length;
//     }

//     const familyMembersCount =
//       item.family_group?.parents?.length === 0
//         ? 1
//         : item.family_group.parents.length;
//     preference_a_points += getPreferencePoints(
//       item.preference_a,
//       familyMembersCount
//     );
//     preference_b_points += getPreferencePoints(
//       item.preference_b,
//       familyMembersCount
//     );
//     preference_c_points += getPreferencePoints(
//       item.preference_c,
//       familyMembersCount
//     );

//     if (item.preference_mass === "9.30am") {
//       nineThirtyAMCount += familyMembersCount;
//     } else if (item.preference_mass === "11.00am") {
//       elevenAMCount += familyMembersCount;
//     } else if (item.preference_mass === "6.00pm; Saturday") {
//       sixPMCount += familyMembersCount;
//     } else if (item.preference_mass === "8.00am") {
//       eightAMCount += familyMembersCount;
//     }
//   });
//   const noResponseCount = 6 * (familyMembersTotalCount - familyResponseCount);

//   const totalConsultationPoints =
//     preference_a_points +
//     preference_b_points +
//     preference_c_points +
//     noResponseCount;

//   const preference_a_percentage = Math.round(
//     (preference_a_points / totalConsultationPoints) * 100
//   );
//   const preference_b_percentage = Math.round(
//     (preference_b_points / totalConsultationPoints) * 100
//   );
//   const preference_c_percentage = Math.round(
//     (preference_c_points / totalConsultationPoints) * 100
//   );
//   const no_response_percentage = Math.round(
//     (noResponseCount / totalConsultationPoints) * 100
//   );

//   return {
//     preference_a_points,
//     preference_b_points,
//     preference_c_points,
//     preference_a_percentage,
//     preference_b_percentage,
//     preference_c_percentage,
//     noResponseCount: noResponseCount / 6,
//     nineThirtyAMCount,
//     elevenAMCount,
//     sixPMCount,
//     eightAMCount,
//     familyResponseCount,
//     no_response_percentage,
//   };
// };

const getTotalConsultationsV2 = async () => {
  const PREFERENCES = ["a", "b", "c"];
  const RANKS = ["1st", "2nd", "3rd"];
  const MASS_TIMES = [
    { key: "nineThirtyAMCount", value: "9.30am" },
    { key: "elevenAMCount", value: "11.00am" },
    { key: "sixPMCount", value: "6.00pm; Saturday" },
    { key: "eightAMCount", value: "8.00am" },
  ];

  const { data: consultations, error } = await supabase
    .from("consultations")
    .select("*");

  if (error) throw `Error fetching total consultations: ${error.message}`;

  const { count: familyTotalCount, error: familyMembersError } = await supabase
    .from("family_group")
    .select("id", { count: "exact", head: true });

  if (familyMembersError) {
    throw `Error fetching family members count: ${familyMembersError.message}`;
  }

  // Initialize aggregation object
  const consultationData = {
    noResponseCount: familyTotalCount - consultations.length,
  };

  // Initialize preference counts and points
  PREFERENCES.forEach((preference) => {
    RANKS.forEach((rank) => {
      consultationData[`preference_${preference}_${rank}_count`] = 0;
      consultationData[`preference_${preference}_${rank}_percentage`] = 0;
    });
  });

  // Initialize mass time counts
  MASS_TIMES.forEach((massTime) => {
    consultationData[massTime.key] = 0;
  });

  // Aggregate data
  consultations.forEach((item) => {
    PREFERENCES.forEach((preference) => {
      RANKS.forEach((rank) => {
        if (item[`preference_${preference}`] === rank) {
          consultationData[`preference_${preference}_${rank}_count`] += 1;
        }
      });
    });

    MASS_TIMES.forEach((massTime) => {
      if (item.preference_mass === massTime.value) {
        consultationData[massTime.key] += 1;
      }
    });
  });

  // Calculate percentages for each preference
  PREFERENCES.forEach((pref) => {
    const total =
      RANKS.reduce(
        (sum, rank) =>
          sum + consultationData[`preference_${pref}_${rank}_count`],
        0
      ) || 1;

    RANKS.forEach((rank) => {
      consultationData[`preference_${pref}_${rank}_percentage`] = Math.round(
        (consultationData[`preference_${pref}_${rank}_count`] / total) * 100
      );
    });
  });
  consultationData.totalResponses = consultations.length;

  // Find the preference with the highest "1st" count
  const firstCounts = [
    { key: "a", count: consultationData.preference_a_1st_count },
    { key: "b", count: consultationData.preference_b_1st_count },
    { key: "c", count: consultationData.preference_c_1st_count },
  ];
  const maxFirst = Math.max(...firstCounts.map((p) => p.count));
  const mostPreferred = firstCounts.find(
    (p) => p.count === maxFirst && maxFirst > 0
  );

  consultationData.mostPreferredPreference =
    mostPreferred?.key === "a"
      ? "a.) 7.45am, 9.15am, 11.15am"
      : mostPreferred?.key === "b"
        ? "b.) 7.45am, 9.30am, 11.30am"
        : mostPreferred?.key === "c"
          ? "c.) 8.00am, 9.30am, 11.30am"
          : "No preference";

  const totalFirstVotes =
    consultationData.preference_a_1st_count +
    consultationData.preference_b_1st_count +
    consultationData.preference_c_1st_count;

  consultationData.mostPreferredPercentage =
    mostPreferred?.count > 0 && totalFirstVotes > 0
      ? Math.round((mostPreferred.count / totalFirstVotes) * 100)
      : 0;

  // Find the most preferred mass time (the one with the highest count)
  const massTimeCounts = MASS_TIMES.map((massTime) => ({
    value: massTime.value,
    count: consultationData[massTime.key],
  }));
  const maxMassCount = Math.max(...massTimeCounts.map((m) => m.count));
  const mostPreferredMass = massTimeCounts.find(
    (m) => m.count === maxMassCount && maxMassCount > 0
  );

  consultationData.mostPreferredMassTime =
    mostPreferredMass?.value || "No preference";

  return consultationData;
};

export { addConsultation, checkConsultationExistence, getTotalConsultationsV2 };
