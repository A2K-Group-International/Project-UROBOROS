import { supabase } from "./supabaseClient";

export const getUserMinistry = async (userId, ministryId) => {
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id, groups(ministry_id)")
    .eq("user_id", userId)
    .eq("groups.ministry_id", ministryId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user ministry:", error);
  }

  // If not in the group
  if (!data) {
    return false;
  }

  return true;
};

export const submitRegistrationForm = async (userId, formData) => {
  const dataToSubmit = {
    ...formData,
    date_of_birth: formData.date_of_birth
      ? formData.date_of_birth.toISOString()
      : null,
    baptism_date: formData.baptism_date
      ? formData.baptism_date.toISOString()
      : null,
  };
  const { data, error } = await supabase
    .from("confirmation_registrations")
    .insert([
      {
        user_id: userId,
        data: dataToSubmit,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

export const getUserCoordinator = async (userId, ministryId) => {
  const { data, error } = await supabase
    .from("ministry_coordinators")
    .select("*")
    .eq("coordinator_id", userId)
    .eq("ministry_id", ministryId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user coordinator:", error);
  }
  return !!data;
};
