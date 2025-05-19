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

const updatePassword = async ({ email, currentPassword, password }) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (error) {
    throw new Error("current password is incorrect.");
  }

  // If login is successful, the current password is correct
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  });
  if (updateError) {
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
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (data) {
    throw new Error("email already exist. Please use another email");
  }

  const { error } = await supabase.auth.updateUser(
    {
      email,
    },
    {
      emailRedirectTo: "https://portal.saintlaurence.org.uk/profile",
    }
  );

  if (error) {
    throw new Error("Error updating email", error.message);
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

const updateName = async ({ userId, first_name, last_name }) => {
  const { error } = await supabase
    .from("users")
    .update({
      first_name,
      last_name,
    })
    .eq("id", userId);

  if (error) {
    throw new Error("Error updating name!", error.message);
  }

  const { error: parentError } = await supabase
    .from("parents")
    .update({
      first_name,
      last_name,
    })
    .eq("parishioner_id", userId);

  if (parentError) {
    throw new Error("Error pupdating parent name", error.message);
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
};
