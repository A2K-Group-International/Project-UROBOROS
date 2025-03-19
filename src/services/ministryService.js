import { supabase } from "./supabaseClient";

export const getOneMinistryGroup = async (ministryId) => {
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, description, ministry_id")
    .eq("ministry_id", ministryId);

  if (error) throw new Error();

  return data;
};

export const getMinistryVolunteers = async (ministryId) => {
  const { data: getGroup, error: groupError } = await supabase
    .from("groups")
    .select("id, name, ministry_id")
    .eq("ministry_id", ministryId)
    .eq("name", "Volunteers")
    .single();

  if (groupError) {
    if (groupError.code === "PGRST116") {
      return []; // Return empty array if no volunteers group exists
    }
    throw new Error(groupError.message);
  }

  const { data: volunteerList, error: volunteerError } = await supabase
    .from("group_members")
    .select(`users(id, first_name, last_name)`)
    .eq("group_id", getGroup.id);

  if (volunteerError) {
    throw new Error(volunteerError.message);
  }

  // Transform data to a more usable format
  return volunteerList || [];
};

/**
 * Get all ministries from the table.
 * @returns {Promise<Object>} Response containing data or error.
 */
export const getAllMinistries = async () => {
  const { data, error } = await supabase
    .from("ministries")
    .select("*, ministry_coordinators(id)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  data.map((ministry) => {
    const url = supabase.storage
      .from("Uroboros")
      .getPublicUrl(ministry.image_url);
    ministry.image_url = url.data.publicUrl;
  });

  return data;
};

export const getAssignedMinistries = async (userId) => {
  const { data, error } = await supabase
    .from("ministry_coordinators")
    .select("ministries(*)")
    .eq("coordinator_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  // Process each ministry to get the proper image URL
  const arrangedData = data.map((item) => {
    // Get the ministry object
    const ministry = item.ministries;

    // Only process image URL if it exists
    if (ministry && ministry.image_url) {
      const { data: urlData } = supabase.storage
        .from("Uroboros")
        .getPublicUrl(ministry.image_url);

      ministry.image_url = urlData.publicUrl;
    }

    return ministry;
  });

  return arrangedData;
};

export const getMinistryGroups = async (userId) => {
  if (!userId) {
    console.error("User ID is required");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("group_members")
      .select(
        `id, 
         joined_at, 
         groups(id, name, description, ministry_id, ministry:ministries(id, ministry_name, image_url)), 
         users(id)`
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching ministry groups:", error);
      throw new Error(error.message);
    }

    // Transform the data to group by ministries
    const groupedData = data.reduce((acc, item) => {
      const ministryId = item.groups.ministry.id;
      const ministryName = item.groups.ministry.ministry_name;
      const imageUrl = item.groups.ministry.image_url;

      // Get the public URL properly
      let publicUrl = null;
      if (imageUrl) {
        const { data: urlData } = supabase.storage
          .from("Uroboros")
          .getPublicUrl(imageUrl);
        publicUrl = urlData.publicUrl;
      }

      if (!acc[ministryId]) {
        acc[ministryId] = {
          ministry_id: ministryId,
          ministry_name: ministryName,
          image_url: publicUrl,
          groups: [],
        };
      }

      acc[ministryId].groups.push({
        group_id: item.groups.id,
        group_name: item.groups.name,
        description: item.groups.description,
        joined_at: item.joined_at,
      });

      return acc;
    }, {});

    // Convert the grouped data into an array
    const result = Object.values(groupedData);

    return result;
  } catch (error) {
    console.error("Exception in getMinistryGroups:", error);
    return [];
  }
};

/**
 * Get a single ministry by its ID.
 * @param {string} id - UUID of the ministry.
 * @returns {Promise<Object>} Response containing data or error.
 */
export const getMinistryById = async (id) => {
  return await supabase.from("ministries").select("*").eq("id", id).single();
};

export const getMinistryCoordinators = async (ministryId) => {
  const { data, error } = await supabase
    .from("ministry_coordinators")
    .select("id,users(id, first_name,last_name)")
    .eq("ministry_id", ministryId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const addCoordinators = async ({ ministryId, coordinatorsData }) => {
  // Extract ministry-coordinator pairs
  const coordinatorIds = coordinatorsData?.map((c) => c.coordinator_id);

  // Check if the combination of ministryId and coordinator_id already exists
  const { data: existingCoordinators, error: checkError } = await supabase
    .from("ministry_coordinators")
    .select("coordinator_id, ministry_id")
    .in("coordinator_id", coordinatorIds)
    .eq("ministry_id", ministryId);

  if (checkError) {
    throw new Error("Error checking existing coordinators");
  }

  if (existingCoordinators?.length > 0) {
    throw new Error("coordinators already exist in this ministry.");
  }

  // Insert new coordinators
  const { error: insertError } = await supabase
    .from("ministry_coordinators")
    .insert(coordinatorsData);

  if (insertError) {
    throw new Error("Error assigning coordinators");
  }
};

export const removeCoordinator = async ({ ministryId, coordinator_id }) => {
  const { error } = await supabase
    .from("ministry_coordinators")
    .delete()
    .eq("id", coordinator_id)
    .eq("ministry_id", ministryId);

  if (error) {
    console.error("Error deleting coordinator:", error.message);
    throw new Error(error.message);
  }
};
/**
 * Delete an image from storage
 * @param {string} path - Storage path to the image
 * @returns {Promise<Object>} Response containing data or error.
 */
export const deleteImageFromStorage = async (path) => {
  if (!path) return { data: null, error: null };

  const { data, error } = await supabase.storage
    .from("Uroboros")
    .remove([path]);

  if (error) {
    console.error("Error deleting image:", error.message);
  }

  return { data, error };
};

/**
 * Create a new ministry.
 * @param {Object} params - The ministry object with all required data.
 * @returns {Promise<Object>} Response containing data or error.
 */
export const createMinistry = async ({
  coordinators,
  ministry_name,
  ministry_description,
  ministry_image,
}) => {
  try {
    //  Upload the image (if provided)
    let imagePath = null;
    if (ministry_image) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Uroboros")
        .upload(
          `ministry_images/${ministry_name}_${Date.now()}`,
          ministry_image
        );

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      imagePath = uploadData.path;
    }

    //  Insert ministry data with the image path
    const { data, error } = await supabase
      .from("ministries")
      .insert([
        {
          ministry_name,
          ministry_description,
          image_url: imagePath,
        },
      ])
      .select("id")
      .single();

    if (error) {
      // If DB insertion fails, clean up the uploaded image
      if (imagePath) {
        await deleteImageFromStorage(imagePath);
      }
      throw new Error(`Ministry creation failed: ${error.message}`);
    }

    //  Add coordinators if provided
    if (coordinators && coordinators.length > 0) {
      const coordinatorsData = coordinators.map((coordinator) => ({
        ministry_id: data.id,
        coordinator_id: coordinator,
      }));

      await addCoordinators({ ministryId: data.id, coordinatorsData });
    }

    return data;
  } catch (error) {
    console.error("Error in createMinistry:", error);
    throw error;
  }
};

/**
 * Update a ministry by its ID.
 * @param {Object} params - Object containing the updated fields.
 * @returns {Promise<Object>} Response containing data or error.
 */
export const editMinistry = async ({
  ministryId,
  ministry_name,
  ministry_description,
  ministry_image,
}) => {
  try {
    //  Update basic ministry details if provided
    if (ministry_name || ministry_description) {
      const updateData = {};
      if (ministry_name) updateData.ministry_name = ministry_name;
      if (ministry_description)
        updateData.ministry_description = ministry_description;

      const { error } = await supabase
        .from("ministries")
        .update(updateData)
        .eq("id", ministryId);

      if (error) {
        throw new Error(`Failed to update ministry details: ${error.message}`);
      }
    }

    //  Update image if a new one is provided
    if (ministry_image instanceof File) {
      // Get current image URL to delete later
      const { data: currentMinistry, error: fetchError } = await supabase
        .from("ministries")
        .select("image_url")
        .eq("id", ministryId)
        .single();

      if (fetchError) {
        throw new Error(
          `Error fetching current ministry: ${fetchError.message}`
        );
      }

      // Generate a unique file name to prevent conflicts
      const fileName = `ministry_images/${ministry_name || "ministry"}_${Date.now()}`;

      // Upload new image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Uroboros")
        .upload(fileName, ministry_image);

      if (uploadError) {
        throw new Error(`Error uploading new image: ${uploadError.message}`);
      }

      // Update ministry with new image URL
      const { error: updateError } = await supabase
        .from("ministries")
        .update({ image_url: uploadData.path })
        .eq("id", ministryId);

      if (updateError) {
        // If update fails, remove the uploaded image
        await deleteImageFromStorage(uploadData.path);
        throw new Error(
          `Error updating ministry image: ${updateError.message}`
        );
      }

      // Delete old image if exists and is different
      if (
        currentMinistry?.image_url &&
        currentMinistry.image_url !== uploadData.path
      ) {
        await deleteImageFromStorage(currentMinistry.image_url);
      }
    }

    // Return the updated ministry with public URL for image
    const { data, error } = await supabase
      .from("ministries")
      .select("*")
      .eq("id", ministryId)
      .single();

    if (error) {
      throw new Error(`Error fetching updated ministry: ${error.message}`);
    }

    // Transform the image URL to a public URL
    if (data.image_url) {
      const { data: urlData } = supabase.storage
        .from("Uroboros")
        .getPublicUrl(data.image_url);

      data.image_url = urlData.publicUrl;
    }

    return data;
  } catch (error) {
    console.error("Error in editMinistry:", error);
    throw error;
  }
};

/**
 * Delete a ministry by its ID.
 * @param {string} id - UUID of the ministry.
 * @returns {Promise<Object>} Response containing success status or error.
 */
export const deleteMinistry = async (id) => {
  if (!id) {
    throw new Error("Ministry ID is required");
  }

  try {
    //  Get the ministry's image URL
    const { data, error: findError } = await supabase
      .from("ministries")
      .select("image_url")
      .eq("id", id)
      .single();

    if (findError) {
      throw new Error(`Error fetching ministry image: ${findError.message}`);
    }

    const imageUrl = data.image_url;

    //  Delete the ministry record
    const { error } = await supabase.from("ministries").delete().eq("id", id);

    if (error) {
      return {
        success: false,
        error: `Error deleting ministry: ${error.message}`,
        imageUrl,
      };
    }

    //  Delete the image if it exists
    if (imageUrl) {
      const { error: deleteImageError } =
        await deleteImageFromStorage(imageUrl);

      if (deleteImageError) {
        return {
          success: true,
          warning: `Ministry deleted but image removal failed: ${deleteImageError.message}`,
          imageUrl,
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteMinistry:", error);
    return { success: false, error: error.message };
  }
};

export const fetchMinistryAssignedUsers = async (ministryId) => {
  let query = supabase
    .from("ministry_assignments")
    .select("*, users(first_name, last_name, id)"); // Select first_name, last_name from the users table

  // Check if ministryId is null or a valid ID
  if (ministryId) {
    // If ministryId is valid, filter by ministry_id
    query = query.eq("ministry_id", ministryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const fetchAvailableVolunteers = async (ministryId) => {
  try {
    // Fetch all volunteers (role = "volunteer")
    const { data: allVolunteers, error: volunteersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, role");
    // .eq("role", "volunteer");

    if (volunteersError) {
      console.error("Error fetching all volunteers:", volunteersError.message);
      return [];
    }

    // Fetch users already assigned to the given ministry (using the ministryId)
    const { data: assignedMembers, error: assignedError } = await supabase
      .from("ministry_assignments")
      .select("user_id")
      .eq("ministry_id", ministryId); // Filter by the given ministry_id

    if (assignedError) {
      console.error("Error fetching assigned members:", assignedError.message);
      return [];
    }

    // Extract user IDs from the volunteer_assignments table
    const assignedUserIds = assignedMembers.map((member) => member.user_id);

    // Filter out users who are already assigned to the ministry
    const availableVolunteers = allVolunteers.filter(
      (volunteer) => !assignedUserIds.includes(volunteer.id)
    );

    return availableVolunteers;
  } catch (error) {
    console.error("Error fetching available volunteers:", error.message);
    return [];
  }
};
export const assignNewVolunteers = async (ministryId, newMembers) => {
  if (!Array.isArray(newMembers)) {
    throw new Error("newMembers should be an array");
  }

  const mappedData = newMembers.map((userId) => ({
    ministry_id: ministryId,
    user_id: userId,
  }));

  try {
    const { data, error } = await supabase
      .from("ministry_assignments")
      .insert(mappedData);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error during insertion:", error.message);
    throw error;
  }
};

export const fetchMinistryMembersFirstNamesAndCount = async (ministryId) => {
  const { data, error, count } = await supabase
    .from("ministry_assignments")
    .select("users(first_name)", { count: "exact" })
    .eq("ministry_id", ministryId)
    .limit(4);

  if (error) throw new Error(error.message);

  return {
    firstNames: data.map((user) => user.users.first_name),
    count,
  };
};

export const removeMinistryVolunteer = async (ministryId, memberId) => {
  try {
    const { data, error } = await supabase
      .from("ministry_assignments") // Targeting the right table
      .delete() // Deleting the assignment
      .eq("ministry_id", ministryId) // Filter by ministry_id
      .eq("user_id", memberId); // Filter by user_id (adjust based on actual column names)

    if (error) {
      throw new Error(error.message); // Handle error if deletion fails
    }

    return data;
  } catch (error) {
    console.error("Error removing ministry volunteer:", error.message);
    throw error; // Re-throw the error to be handled in the component
  }
};

/**
 * Fetches all ministry IDs that a user is a member of through group memberships
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array<string>>} - Array of ministry IDs
 */
export const fetchUserMinistryIds = async (userId) => {
  if (!userId) {
    console.error("User ID is required");
    return [];
  }

  // Query to get all groups the user is a member of and their associated ministries
  const { data: ministries, error } = await supabase
    .from("group_members")
    .select("groups(ministry_id)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user's ministries:", error.message);
    throw new Error(error.message);
  }

  // Extract unique ministry IDs from the results
  const ministryIds = ministries.map((item) => item.groups.ministry_id);

  // Remove duplicates using Set
  const uniqueMinistryIds = [...new Set(ministryIds)];

  return uniqueMinistryIds;
};
