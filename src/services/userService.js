import { supabase } from "./supabaseClient"; // Supabase client import
import { paginate } from "@/lib/utils";

/**
 * This function will fetch for user information from the database.
 * @param {string} userId The user ID to fetch from the database.
 * @returns {Promise<object>} The user object fetched from the database.
 * @throws {Error} If an error occurs while fetching the user.
 */
const getUser = async (userId) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }
};

// Fetch users by role
const getUsersByRole = async (role) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, first_name,last_name, email, role") // Adjust columns as needed
      .eq("role", role); // Filter by role directly

    if (error) throw error;

    return users;
  } catch (error) {
    console.error("Error fetching users by role:", error.message);
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, first_name, last_name,email");

    if (error) throw error.message;
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    throw error;
  }
};
const getAllUserLicenses = async ({ status }) => {
  const is_license_verified = status === "active" ? true : false;

  const { data: licenses, error } = await supabase
    .from("users")
    .select(
      "id, first_name, last_name,email, is_license_verified, licenses(id,license_code)"
    )
    .eq("is_license_verified", is_license_verified);
  if (error) {
    throw new Error(`Error fetching all user licenses:  ${error.message}`); // Improved error handling
  }

  if (status === "pending") {
    // Filter out users who have no licenses
    return licenses.filter((license) => license.licenses.length > 0);
  }

  return licenses;
};

const getUsers = async ({ page, pageSize, roles }) => {
  try {
    const filters = {
      in: {
        column: "role",
        value: roles,
      },
    };

    const data = await paginate({
      key: "users",
      page,
      pageSize,
      filters, // Apply filters to the pagination function
      order: [{ column: "created_at", ascending: false }],
    });

    return data;
  } catch (error) {
    console.error("Error fetching users", error.message);
    throw error;
  }
};

/**
 *
 * @param {Object} payload
 */
const updateUser = async (id, payload) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error updating user", error.message);
    throw error;
  }
};

const removeUser = async (id) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error removing user", error.message);
    throw error;
  }
};

const activateUser = async ({ id, payload }) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .update({ is_confirmed: payload }) // Set the is_confirmed field to the boolean payload
      .eq("id", id) // Find the user by ID
      .select()
      .single(); // Ensure you update only one user

    if (error) throw error;

    return user;
  } catch (error) {
    console.error("Error updating user", error.message);
    throw error;
  }
};

const forgotPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://portal.saintlaurence.org.uk/reset-password",
  });
  if (error) {
    console.error("Error sending reset password email:", error.message);
  }
};

const updatePassword = async ({ currentPassword, password }) => {
  try {
    // Get current user session
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError) {
      throw new Error("Failed to get user session: ", sessionError.message);
    }
    // Ensure the user is logged in
    if (!user) {
      throw new Error("User is not logged in.");
    }
    // Verify the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      throw new Error("Current password is incorrect.");
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      throw new Error("Failed to update password: ", updateError.message);
    }
  } catch (error) {
    console.error("Error updating password:", error.message);
    throw error;
  }
};

const resetPassword = async ({ password }) => {
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });
  if (updateError) {
    throw updateError;
  }
};

const sendChangeEmailVerification = async (email) => {
  try {
    // 1. Check if email already exists in "users" table
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (data) {
      throw new Error("This email already exists. Please use another one.");
    }

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = No rows found, which is OK here
      throw new Error(fetchError.message);
    }

    // 2. Try to update the user email
    const { error: updateError } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: "https://portal.saintlaurence.org.uk/profile" }
    );

    if (updateError) {
      throw new Error(updateError.message);
    }
  } catch (error) {
    console.error("Error sending change email verification:", error.message);
    throw error;
  }
};

const updateEmail = async ({ user_id, email }) => {
  const { error: updateError } = await supabase
    .from("users")
    .update([{ email }])
    .eq("id", user_id);

  if (updateError) {
    throw new Error("Error updating email", updateError.message);
  }
};

const updateName = async ({ user_id, first_name, last_name }) => {
  const { error } = await supabase
    .from("users")
    .update({
      first_name,
      last_name,
    })
    .eq("id", user_id);

  if (error) {
    throw new Error("Error updating name!", error.message);
  }

  const { error: parentError } = await supabase
    .from("parents")
    .update({
      first_name,
      last_name,
    })
    .eq("parishioner_id", user_id);

  if (parentError) {
    throw new Error("Error pupdating parent name", error.message);
  }
};
const toggleEmailNotification = async ({ userId, isReceivingNotification }) => {
  const { error } = await supabase
    .from("users")
    .update({
      email_notifications_enabled: isReceivingNotification,
    })
    .eq("id", userId);

  if (error) {
    throw new Error("Error updating notification!", error.message);
  }
};

export {
  getUser,
  getUsersByRole,
  getUsers,
  updateUser,
  removeUser,
  updatePassword,
  activateUser,
  forgotPassword,
  sendChangeEmailVerification,
  updateEmail,
  updateName,
  resetPassword,
  toggleEmailNotification,
  getAllUsers,
  getAllUserLicenses,
};
