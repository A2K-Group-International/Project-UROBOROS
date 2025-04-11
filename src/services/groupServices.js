import { supabase } from "./supabaseClient";

const fetchGroupMembers = async (groupId) => {
  if (!groupId) {
    console.error("No groupId provided to fetchGroupMembers");
    return [];
  }

  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
        *,
        users:user_id (
          id,
          first_name,
          last_name
        )
      `
    )
    .eq("group_id", groupId);

  if (error) {
    console.error("Supabase query error:", error);
    throw new Error(`Error fetching group members: ${error.message}`);
  }

  return data;
};

const fetchGroups = async (ministryId) => {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("ministry_id", ministryId);

  if (error) {
    throw new Error(`Error fetching groups${error.message}`);
  }

  // Process each group to get the proper image URL
  const arrangedData = data.map((group) => {
    // Create a copy of the group object
    const processedGroup = { ...group };

    // Only process image URL if it exists
    if (processedGroup.image_url) {
      const { data: urlData } = supabase.storage
        .from("Uroboros")
        .getPublicUrl(processedGroup.image_url);

      processedGroup.image_url = urlData.publicUrl;
    }

    return processedGroup;
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

const createGroup = async ({
  ministryId,
  name,
  description,
  created_by,
  members,
  groupImage,
}) => {
  try {
    //  Upload the image (if provided)
    let imagePath = null;
    if (groupImage) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Uroboros")
        .upload(`group_images/${name}_${Date.now()}`, groupImage);

      if (uploadError) {
        throw new Error(`Image upload failed: ${uploadError.message}`);
      }

      imagePath = uploadData.path;
    }
    const { data: group, error } = await supabase
      .from("groups")
      .insert([
        {
          ministry_id: ministryId,
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
      throw new Error(`Error creating group: ${error.message}`);
    }

    // If there are members to add, add them
    if (members && members.length > 0) {
      const membersData = members.map((memberId) => ({
        group_id: group.id,
        user_id: memberId,
      }));

      const { error: membersError } = await supabase
        .from("group_members")
        .insert(membersData);

      if (membersError) {
        throw new Error(`Error adding group members: ${membersError.message}`);
      }
    }

    return group;
  } catch (error) {
    console.error("Error in create group:", error);
    throw error;
  }
};

const editGroup = async ({ groupId, name, description, groupImage }) => {
  // Data validation
  if (!groupId) {
    throw new Error("Group ID is required");
  }

  // Get the currect group to check for existing image
  const { data: currentGroup, error: fetchError } = await supabase
    .from("groups")
    .select("image_url")
    .eq("id", groupId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching current group: ${fetchError.message}`);
  }

  // Create update object with only the fields to update
  const updateData = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  // Handle image upload and deletion
  let imagePath = null;

  // If a new image is provided (File object)
  if (groupImage instanceof File) {
    // Upload the new image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Uroboros")
      .upload(`group_images/${name}_${Date.now()}`, groupImage);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    imagePath = uploadData.path;
    updateData.image_url = imagePath;

    // Delete old image if it exists
    if (currentGroup.image_url) {
      await deleteImageFromStorage(currentGroup.image_url);
    }
  }
  // If image is explicitly set to null, remove the current image
  else if (groupImage === null && currentGroup.image_url) {
    await deleteImageFromStorage(currentGroup.image_url);
    updateData.image_url = null;
  }

  // No fields to update
  if (Object.keys(updateData).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    const { data, error } = await supabase
      .from("groups")
      .update(updateData)
      .eq("id", groupId)
      .select();

    if (error) {
      console.error("Error editing group:", error);
      throw new Error(`Error editing group: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Exception in editGroup:", error);
    throw error;
  }
};

const addMember = async ({ groupId, members }) => {
  if (!groupId || !members || !members.length) {
    throw new Error("Group ID and members are required");
  }

  const membersToAdd = members.map((userId) => ({
    group_id: groupId,
    user_id: userId,
  }));

  try {
    const { data, error } = await supabase
      .from("group_members")
      .insert(membersToAdd)
      .select();

    if (error) {
      console.error("Error adding members:", error);
      throw new Error(`Error adding members: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Exception in addGroupMembers:", error);
    throw error;
  }
};

const removeMember = async ({ userId, groupId }) => {
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);
  if (error) {
    throw new Error("Error removing member");
  }
};

const deleteGroup = async ({ groupId }) => {
  const { data: group, error: fetchError } = await supabase
    .from("groups")
    .select("image_url")
    .eq("id", groupId)
    .single();

  if (fetchError) {
    console.error("Error fetching group:", fetchError);
    throw new Error(`Failed to fetch group: ${fetchError.message}`);
  }

  // Delete the image if it exists
  if (group && group.image_url) {
    await deleteImageFromStorage(group.image_url);
  }

  const { error: groupError } = await supabase
    .from("groups")
    .delete()
    .eq("id", groupId);

  if (groupError) {
    console.error("Error deleting group:", groupError);
    throw new Error(`Failed to delete group: ${groupError.message}`);
  }
};

const transferMembersFetchGroups = async (ministryId, currentGroupId) => {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("ministry_id", ministryId)
    .neq("id", currentGroupId);

  if (error) {
    throw new Error(`Error fetching groups${error.message}`);
  }

  return data;
};

const transferUserToGroup = async ({ userId, currentGroupId, newGroupId }) => {
  try {
    const { data, error } = await supabase
      .from("group_members")
      .update({
        group_id: newGroupId,
        joined_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("group_id", currentGroupId)
      .select();

    if (error) {
      throw new Error(`Error transferring user to new group: ${error.message}`);
    }

    // Check if the update affected any rows
    if (data?.length === 0) {
      throw new Error("User is not a member of the specified group");
    }

    return data;
  } catch (error) {
    console.error("Error transferring user:", error);
    throw error;
  }
};

export {
  createGroup,
  editGroup,
  deleteGroup,
  addMember,
  removeMember,
  fetchGroupMembers,
  fetchGroups,
  transferMembersFetchGroups,
  transferUserToGroup,
};
