import axios from "axios";
import { supabase } from "./supabaseClient"; // Supabase client import
import { paginate } from "@/lib/utils";
import { getAuthToken } from "./emailService";

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

const getAllUserLicenses = async ({ status, page = 1, pageSize = 10 }) => {
  try {
    const is_token_used =
      status === "active" || status === "inactive" ? true : false;
    const is_license_verified = status === "active" ? true : false;

    const filters = {
      eq: [
        { column: "users.is_license_verified", value: is_license_verified },
        { column: "is_token_used", value: is_token_used },
      ],
    };

    const data = await paginate({
      key: "licenses",
      page,
      pageSize,
      filters,
      select:
        "id, license_code, is_token_used, users!inner(id, first_name, last_name, email, is_license_verified)",
      order: [{ column: "created_at", ascending: false }],
    });

    return data;
  } catch (error) {
    console.error("Error fetching user licenses:", error.message);
    throw new Error(`Error fetching all user licenses: ${error.message}`);
  }
};

const assignNewLicense = async (data) => {
  const token = await getAuthToken();
  try {
    const { data: result } = await axios.post(
      // `${import.meta.env.VITE_SPARKD_API_URL}/feedback/create`,
      `http://localhost:3000/licenses/`,
      {
        user_id: data.userId,
        license_code: data.licenseCode,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      message: "License successfully sent",
      details: result,
    };
  } catch (error) {
    console.error("Error in assigning license:", error);
    throw new Error(
      error.response?.data?.message || "Failed to create license request"
    );
  }
};

const resendLicense = async (licenseId) => {
  const token = await getAuthToken();
  try {
    const { data: result } = await axios.post(
      // `${import.meta.env.VITE_SPARKD_API_URL}/feedback/create`,
      `http://localhost:3000/licenses/resend/`,
      { licenseId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return {
      success: true,
      message: "License successfully resent",
      details: result,
    };
  } catch (error) {
    console.error("Error in resending license:", error);
    throw new Error(
      error.response?.data?.message || "Failed to resend license request"
    );
  }
};

const deactivateLicense = async (licenseId) => {
  try {
    // First, get the license to find the associated user_id
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("id, user_id")
      .eq("id", licenseId)
      .single();

    if (licenseError) {
      throw new Error(`Error finding license: ${licenseError.message}`);
    }

    if (!license || !license.user_id) {
      throw new Error("License not found or has no associated user");
    }

    // Then update the user's verification status
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ is_license_verified: false })
      .eq("id", license.user_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Error updating user verification status: ${updateError.message}`
      );
    }

    return {
      license,
      user: updatedUser,
    };
  } catch (error) {
    console.error("Deactivate license error:", error);
    throw error;
  }
};

const removeLicense = async (licenseId) => {
  const { data: license, error } = await supabase
    .from("licenses")
    .delete()
    .eq("id", licenseId)
    .select()
    .single();
  if (error) {
    console.error("Error removing license:", error.message);
    throw error;
  }
  return license;
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

const activateLicense = async ({ licenseId, licenseCode }) => {
  try {
    // Get the license to find the associated user_id
    const { data: license, error: licenseError } = await supabase
      .from("licenses")
      .select("id, user_id")
      .eq("id", licenseId)
      .single();

    if (licenseError) {
      throw new Error(`Error finding license: ${licenseError.message}`);
    }

    if (!license || !license.user_id) {
      throw new Error("License not found or has no associated user");
    }

    // Prepare update data for the license
    const licenseUpdateData = {
      // Only include license_code in update if it's provided and different
      ...(licenseCode && licenseCode !== license.license_code
        ? { license_code: licenseCode }
        : {}),
    };

    // Update the license code if needed
    if (Object.keys(licenseUpdateData).length > 0) {
      const { error: updateLicenseError } = await supabase
        .from("licenses")
        .update(licenseUpdateData)
        .eq("id", licenseId);

      if (updateLicenseError) {
        throw new Error(
          `Error updating license: ${updateLicenseError.message}`
        );
      }
    }

    // Update the user's verification status
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({ is_license_verified: true })
      .eq("id", license.user_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(
        `Error updating user verification status: ${updateError.message}`
      );
    }

    return {
      license: {
        ...license,
        ...(licenseCode ? { license_code: licenseCode } : {}),
      },
      user: updatedUser,
    };
  } catch (error) {
    console.error("Activate license error:", error);
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
  assignNewLicense,
  resendLicense,
  deactivateLicense,
  removeLicense,
  activateLicense,
};
