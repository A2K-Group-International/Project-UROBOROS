import { paginate } from "@/lib/utils";
import { supabase } from "./supabaseClient";

// Check for duplicate names of all family members
export const checkDuplicatedFamilyMember = async (familyId, firstName) => {
  try {
    // Ensure firstName is a valid string
    if (!firstName || typeof firstName !== "string") {
      throw new Error("Invalid first name provided.");
    }

    // Query parents and children tables for duplicate names
    const { data: parentsData, error: parentsError } = await supabase
      .from("parents")
      .select("first_name")
      .eq("family_id", familyId)
      .eq("first_name", firstName.trim());

    const { data: childrenData, error: childrenError } = await supabase
      .from("children")
      .select("first_name")
      .eq("family_id", familyId)
      .eq("first_name", firstName.trim());

    // Handle errors
    if (parentsError) throw new Error(parentsError.message);
    if (childrenError) throw new Error(childrenError.message);

    // Check if the name exists in either table
    const isDuplicate =
      (parentsData && parentsData.length > 0) ||
      (childrenData && childrenData.length > 0);

    return isDuplicate;
  } catch (error) {
    console.error("Error checking for duplicate family member:", error);
    return false;
  }
};

export const addParent = async (parentsData, familyId) => {
  try {
    const { data, error } = await supabase
      .from("parents")
      .upsert(
        parentsData.map((parent) => ({
          family_id: familyId,
          first_name: parent.firstName,
          last_name: parent.lastName,
          contact_number: parent.contactNumber,
        }))
      )
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error adding parent:", error);
    return { success: false, error: error.message };
  }
};

export const addChild = async (childrenData, familyId) => {
  try {
    const { data, error } = await supabase
      .from("children")
      .upsert(
        childrenData.map((child) => ({
          family_id: familyId,
          first_name: child.firstName,
          last_name: child.lastName,
        }))
      )
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error adding child:", error);
    return { success: false, error: error.message };
  }
};

// Function to add family members (parents and children)
export const addFamilyMembers = async (familyData) => {
  try {
    // Begin a transaction or use upsert to ensure data integrity
    const { parents, children, familyId } = familyData;
    let parentData;
    let childData;

    if (parents.length > 0) {
      parentData = await addParent(parents, familyId);
    }
    if (children.length > 0) {
      childData = await addChild(children, familyId);
    }

    return { success: true, parentData, childData };
  } catch (error) {
    console.error("Error adding family members:", error);
    return { success: false, error: error.message };
  }
};

// Get family id
export const getFamilyId = async (userId) => {
  try {
    // Fetch family group where the user is the primary user
    const { error: primaryError } = await supabase
      .from("family_group")
      .select("id")
      .eq("user_id", userId);

    if (primaryError) {
      throw new Error(primaryError.message);
    }

    // If no primary family group found, check if the user is a co-parent
    const { data: coParentFamily, error: coParentError } = await supabase
      .from("parents")
      .select("family_id")
      .eq("parishioner_id", userId);

    if (coParentError) {
      throw new Error(coParentError.message);
    }

    if (!coParentFamily || coParentFamily.length === 0) {
      throw new Error("No family group found for the given user ID");
    }

    if (coParentFamily.length > 1) {
      throw new Error("Multiple family groups found for the given user ID");
    }

    return { id: coParentFamily[0].family_id };
  } catch (error) {
    console.error("Error fetching family id", error);
    return { success: false, error: error.message };
  }
};

// Fetch parents/guardian
export const getGuardian = async (familyId) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!userData || !userData.user) {
      throw new Error("User not logged in or session expired");
    }

    const loggedInUserId = userData.user.id;

    // Fetch the logged-in user first
    const { data: loggedInUser, error: loggedInUserError } = await supabase
      .from("parents")
      .select(
        "id,first_name, last_name, contact_number,family_id, parishioner_id"
      )
      .eq("family_id", familyId)
      .eq("parishioner_id", loggedInUserId)
      .single();

    if (loggedInUserError) {
      throw new Error(loggedInUserError.message);
    }

    // Fetch the rest of the parents excluding the logged-in user
    const { data: otherParents, error: otherParentsError } = await supabase
      .from("parents")
      .select(
        "id,first_name, last_name, contact_number,family_id, parishioner_id"
      )
      .eq("family_id", familyId)
      .or(`parishioner_id.neq.${loggedInUserId},parishioner_id.is.null`);

    if (otherParentsError) {
      throw new Error(otherParentsError.message);
    }

    // Combine the results, ensuring the logged-in user is first
    const parents = [loggedInUser, ...otherParents];

    return parents;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const fetchParents = async (familyId) => {
  const { data, error } = await supabase
    .from("parents")
    .select("id,first_name, last_name, contact_number,family_id")
    .eq("family_id", familyId);
  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Fetchchildren
export const getChildren = async (familyId) => {
  try {
    const { data, error } = await supabase
      .from("children")
      .select("id,first_name, last_name,family_id")
      .eq("family_id", familyId); // Equal to family group

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching user id", error);
    return { success: false, error: error.message };
  }
};

// Edit parent
export const updateParent = async (parentId, data, parentUserId) => {
  if (!data) {
    throw new Error("Data is undefined");
  }

  const { firstName, lastName, contactNumber } = data;

  if (!firstName || !lastName || !contactNumber) {
    throw new Error("First name or last name is missing");
  }

  const { data: updatedParent, error } = await supabase
    .from("parents")
    .update({
      first_name: firstName,
      last_name: lastName,
      contact_number: contactNumber,
    })
    .eq("id", parentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message); // Throw an error to be caught by the mutation
  }
  // Update user details in the 'users' table if userId is provided
  if (parentUserId) {
    const { error: userError } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        contact_number: contactNumber,
      })
      .eq("id", parentUserId);

    if (userError) {
      throw new Error(`Error updating user: ${userError.message}`);
    }
  }

  return updatedParent; // Return the updated child data
};

const deleteAuthUser = async (userId) => {
  await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        apikey: import.meta.env.VITE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SERVICE_ROLE_KEY}`,
      },
    }
  );
};

// Delete parent
export const deleteParent = async (parentId) => {
  try {
    // Fetch the parishioner_id from the parents table
    const { data: parentData, error: fetchError } = await supabase
      .from("parents")
      .select("parishioner_id")
      .eq("id", parentId)
      .single();

    if (fetchError) {
      throw new Error(fetchError.message); // Handle error from Supabase
    }

    const parishionerId = parentData.parishioner_id;

    // Delete the parent from the parents table
    const { data: deletedParent, error: deleteParentError } = await supabase
      .from("parents")
      .delete()
      .eq("id", parentId)
      .select()
      .single();

    if (deleteParentError) {
      throw new Error(deleteParentError.message); // Handle error from Supabase
    }

    // If parishioner_id is not null, delete the user from the users table and Supabase authentication
    if (parishionerId) {
      const { error: deleteUserError } = await supabase
        .from("users")
        .delete()
        .eq("id", parishionerId);

      if (deleteUserError) {
        throw new Error(deleteUserError.message);
      }

      deleteAuthUser(parishionerId);
    }

    return deletedParent; // Return the deleted parent data if successful
  } catch (error) {
    throw new Error(`Error deleting parent: ${error.message}`);
  }
};

// Edit Children
export const updateChild = async (childId, data) => {
  if (!data) {
    throw new Error("Data is undefined");
  }

  const { firstName, lastName } = data;

  if (!firstName || !lastName) {
    throw new Error("First name or last name is missing");
  }

  const { data: updatedChild, error } = await supabase
    .from("children")
    .update({ first_name: firstName, last_name: lastName })
    .eq("id", childId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message); // Throw an error to be caught by the mutation
  }

  return updatedChild; // Return the updated child data
};

// Delete child
export const deleteChild = async (childId) => {
  const { data, error } = await supabase
    .from("children")
    .delete()
    .eq("id", childId)
    .select()
    .single(); // Specify the child ID to delete

  if (error) {
    throw new Error(error.message); // Handle error from Supabase
  }

  return data; // Return the deleted data if successful
};

export const fetchFamilies = async ({ page, pageSize, search }) => {
  const select = `
    id,
    users(id, first_name, last_name, contact_number),
    parents(id, first_name, last_name, contact_number),
    children(id, first_name, last_name)
  `;

  // Base filter to exclude null user_id AND apply search
  const filters = {
    not: { column: "user_id", operator: "is", value: null },
  };

  // Add search filter using the JOINED users table
  if (search) {
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id")
      .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);

    if (usersError) {
      console.error("Error fetching users:", usersError.message);
      return null;
    }

    if (!users || users.length === 0) {
      return [];
    }

    const userIds = users.map((user) => user.id);

    filters.in = { column: "user_id", value: userIds };
  }

  const paginatedData = await paginate({
    key: "family_group",
    page,
    pageSize,
    select,
    filters,
  });

  return paginatedData;
};
