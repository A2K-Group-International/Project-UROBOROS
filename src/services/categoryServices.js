import { supabase } from "@/services/supabaseClient";

const createCategory = async ({ category, userId }) => {
  const { data, error } = await supabase
    .from("event_categories")
    .insert([{ name: category, creator_id: userId }])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const getCategories = async () => {
  // Fetch categories with creator information using a join
  const { data, error } = await supabase
    .from("event_categories")
    .select(
      `
      id,
      name,
      created_at,
      creator_id,
      users:creator_id (
        first_name,
        last_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // Format the response to make it easier to use
  return data.map((category) => ({
    id: category.id,
    name: category.name,
    created_at: category.created_at,
    creator_id: category.creator_id,
    creator_name: category.users
      ? `${category.users.first_name} ${category.users.last_name}`
      : "Unknown",
  }));
};

/**
 * Update an existing category
 * @param {Object} params - Update parameters
 * @param {string} params.id - The UUID of the category to update
 * @param {string} params.category - The new category name
 * @returns {Promise<Object>} - The updated category data
 */
const updateCategory = async ({ id, category }) => {
  const { data, error } = await supabase
    .from("event_categories")
    .update({ name: category })
    .eq("id", id).select(`
      id,
      name,
      created_at,
      creator_id,
      users:creator_id (
        first_name,
        last_name
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  if (data.length === 0) {
    throw new Error("Category not found or could not be updated");
  }

  // Format the response in the same way as getCategories
  return {
    id: data[0].id,
    name: data[0].name,
    created_at: data[0].created_at,
    creator_id: data[0].creator_id,
    creator_name: data[0].users
      ? `${data[0].users.first_name} ${data[0].users.last_name}`
      : "Unknown",
  };
};

/**
 * Delete a category
 * @param {string} id - The UUID of the category to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteCategory = async (id) => {
  const { error } = await supabase
    .from("event_categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
};

export { createCategory, getCategories, updateCategory, deleteCategory };
