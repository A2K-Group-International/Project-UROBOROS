import { supabase } from "./supabaseClient";

const fetchSubgroupMembers = async (subgroupId) => {
  const { data, error } = await supabase
    .from("subgroup_members")
    .select("joined_at,users(id,first_name,last_name)")
    .eq("subgroup_id", subgroupId);

  if (error) {
    throw new Error(`Error fetching subgroup members: ${error.message}`);
  }

  return data;
};

const fetchSubgroups = async (groupId) => {
  const { data, error } = await supabase
    .from("sub_groups")
    .select("*")
    .eq("group_id", groupId);

  if (error) {
    throw new Error(`Error fetching subgroups: ${error.message}`);
  }

  // Process each subgroup to get the proper image URL
  const arrangedData = data.map((subgroup) => {
    // Create a processed subgroup with the public URL if image_url exists
    const processedSubgroup = {
      ...subgroup,
      image_url: subgroup.image_url
        ? supabase.storage.from("Uroboros").getPublicUrl(subgroup.image_url)
            .data?.publicUrl || null
        : null,
    };

    return processedSubgroup;
  });

  return arrangedData;
};

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

const createSubgroup = async ({
  groupId,
  name,
  description,
  created_by,
  members,
  subgroupImage,
}) => {
  let imagePath = null;
  if (subgroupImage) {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Uroboros")
      .upload(`subgroup_images/${name}_${Date.now()}`, subgroupImage);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    imagePath = uploadData.path;
  }

  // Insert the subgroup
  const { data: subgroup, error } = await supabase
    .from("sub_group")
    .insert([
      {
        group_id: groupId,
        name,
        description,
        image_url: imagePath,
        created_by,
      },
    ])
    .select("id")
    .single();

  if (error) {
    // If DB insertion fails, clean up the uploaded image
    if (imagePath) {
      await deleteImageFromStorage(imagePath);
    }
    throw new Error(`Error creating subgroup: ${error.message}`);
  }

  // If there are members to add, add them
  if (members && members.length > 0) {
    const membersData = members.map((memberId) => ({
      subgroup_id: subgroup.id,
      user_id: memberId,
    }));

    const { error: membersError } = await supabase
      .from("subgroup_members")
      .insert(membersData);

    if (membersError) {
      throw new Error(`Error adding subgroup members: ${membersError.message}`);
    }
  }

  return subgroup;
};

const editSubgroup = async ({
  subgroupId,
  name,
  description,
  subgroupImage,
}) => {
  // Data validation
  if (!subgroupId) {
    throw new Error("Subgroup ID is required");
  }

  // Get the current subgroup to check for existing image
  const { data: currentSubgroup, error: fetchError } = await supabase
    .from("sub_groups")
    .select("image_url")
    .eq("id", subgroupId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching current subgroup: ${fetchError.message}`);
  }

  // Create update object with only the fields to update
  const updateData = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  // Handle image upload and deletion
  let imagePath = null;

  // If a new image is provided (File object)
  if (subgroupImage instanceof File) {
    // Upload the new image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Uroboros")
      .upload(`subgroup_images/${name}_${Date.now()}`, subgroupImage);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    imagePath = uploadData.path;
    updateData.image_url = imagePath;

    // Delete old image if it exists
    if (currentSubgroup.image_url) {
      await deleteImageFromStorage(currentSubgroup.image_url);
    }
  }
  // If image is explicitly set to null, remove the current image
  else if (subgroupImage === null && currentSubgroup.image_url) {
    await deleteImageFromStorage(currentSubgroup.image_url);
    updateData.image_url = null;
  }

  // No fields to update
  if (Object.keys(updateData).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    const { data, error } = await supabase
      .from("sub_groups")
      .update(updateData)
      .eq("id", subgroupId)
      .select();

    if (error) {
      console.error("Error editing subgroup:", error);
      throw new Error(`Error editing subgroup: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Exception in editSubgroup:", error);
    throw error;
  }
};

const addSubgroupMember = async ({ subgroupId, members }) => {
  if (!subgroupId || !members || !members.length) {
    throw new Error("Subgroup ID and members are required");
  }

  const membersToAdd = members.map((userId) => ({
    subgroup_id: subgroupId,
    user_id: userId,
  }));

  try {
    const { data, error } = await supabase
      .from("subgroup_members")
      .insert(membersToAdd)
      .select();

    if (error) {
      console.error("Error adding members:", error);
      throw new Error(`Error adding members: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Exception in addSubgroupMembers:", error);
    throw error;
  }
};

const removeSubgroupMember = async ({ userId, subgroupId }) => {
  const { error } = await supabase
    .from("subgroup_members")
    .delete()
    .eq("subgroup_id", subgroupId)
    .eq("user_id", userId);

  if (error) {
    throw new Error("Error removing subgroup member");
  }
};

const deleteSubgroup = async ({ subgroupId }) => {
  const { data: subgroup, error: fetchError } = await supabase
    .from("sub_groups")
    .select("image_url")
    .eq("id", subgroupId)
    .single();

  if (fetchError) {
    console.error("Error fetching subgroup:", fetchError);
    throw new Error(`Failed to fetch subgroup: ${fetchError.message}`);
  }

  // Delete the image if it exists
  if (subgroup && subgroup.image_url) {
    await deleteImageFromStorage(subgroup.image_url);
  }

  const { error: subgroupError } = await supabase
    .from("sub_groups")
    .delete()
    .eq("id", subgroupId);

  if (subgroupError) {
    console.error("Error deleting subgroup:", subgroupError);
    throw new Error(`Failed to delete subgroup: ${subgroupError.message}`);
  }
};

export {
  createSubgroup,
  editSubgroup,
  deleteSubgroup,
  addSubgroupMember,
  removeSubgroupMember,
  fetchSubgroupMembers,
  fetchSubgroups,
};
