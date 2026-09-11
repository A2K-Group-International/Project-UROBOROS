import { paginate } from "@/lib/utils";
import { supabase } from "./supabaseClient";

export const addComment = async ({ comment, user_id, announcement_id }) => {
  if (!user_id || !announcement_id) {
    throw new Error("User ID and Post ID are required!");
  }

  const { error } = await supabase.from("comments").insert([
    {
      content: comment,
      user_id,
      announcement_id,
    },
  ]);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unknown Error.");
  }
};

export const fetchComments = async (page, pageSize, announcement_id) => {
  if (!announcement_id) {
    throw new Error("announcement_id is required!");
  }

  const select = " *, users:profiles(id,first_name, last_name)";
  const order = [{ column: "created_at", ascending: false }];

  const filters = {
    eq: [{ column: "announcement_id", value: announcement_id }],
  };

  // With the updated paginate, `query` (for .match) and `filters` (for .eq, etc.)
  // will both be applied to the count and data queries.
  return await paginate({
    key: "comments",
    page,
    pageSize,
    query: {},
    filters,
    order,
    select,
  });
};

export const deleteComment = async (comment_id) => {
  if (!comment_id) {
    throw new Error("comment_id is required!");
  }

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", comment_id);

  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(error.message || "Unknown Error.");
  }
};

export const updateComment = async ({ comment, comment_id }) => {
  if (!comment_id) {
    throw new Error("comment_id is required!");
  }

  const { error } = await supabase
    .from("comments")
    .update({
      content: comment,
      edited: true,
    })
    .eq("id", comment_id);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unknown Error.");
  }
};

export const likeComment = async ({ comment_id, user_id, columnName }) => {
  if (!comment_id || !user_id || !columnName) {
    throw new Error("comment_id,columnName and user_id is required!");
  }

  const { data: likeExist } = await supabase
    .from("liked_comments")
    .select("id")
    .eq(columnName, comment_id)
    .eq("user_id", user_id);

  const { data: dislikeExist } = await supabase
    .from("disliked_comments")
    .select("id")
    .eq(columnName, comment_id)
    .eq("user_id", user_id);

  if (dislikeExist.length > 0) {
    const { error } = await supabase
      .from("disliked_comments")
      .delete()
      .eq(columnName, comment_id)
      .eq("user_id", user_id);

    if (error) {
      // console.error("Error removing dislike:", error);
      throw new Error(error.message || "Error removing dislike");
    }
  }

  if (likeExist.length > 0) {
    const { error } = await supabase
      .from("liked_comments")
      .delete()
      .eq(columnName, comment_id)
      .eq("user_id", user_id);

    if (error) {
      // console.error("Error removing like:", error);
      throw new Error(error.message || "Error removing like");
    }
  } else {
    const { error } = await supabase
      .from("liked_comments")
      .insert([{ [columnName]: comment_id, user_id }]);

    if (error) {
      // console.error("Error adding like:", error);
      throw new Error(error.message || "Error adding like");
    }
  }
};

export const dislikeComment = async ({ comment_id, user_id, columnName }) => {
  if (!comment_id || !user_id || !columnName) {
    throw new Error("comment_id,columnName and user_id is required!");
  }
  const { data: likeExist } = await supabase
    .from("liked_comments")
    .select("id")
    .eq(columnName, comment_id)
    .eq("user_id", user_id);

  const { data: dislikeExist } = await supabase
    .from("disliked_comments")
    .select("id")
    .eq(columnName, comment_id)
    .eq("user_id", user_id);

  if (likeExist.length > 0) {
    const { error } = await supabase
      .from("liked_comments")
      .delete()
      .eq(columnName, comment_id)
      .eq("user_id", user_id);

    if (error) {
      // console.error("Error removing like:", error);
      throw new Error(error.message || "Error removing like");
    }
  }

  if (dislikeExist.length > 0) {
    const { error } = await supabase
      .from("disliked_comments")
      .delete()
      .eq(columnName, comment_id)
      .eq("user_id", user_id);

    if (error) {
      // console.error("Error removing dislike:", error);
      throw new Error(error.message || "Error removing dislike");
    }
  } else {
    const { error } = await supabase
      .from("disliked_comments")
      .insert([{ [columnName]: comment_id, user_id }]);

    if (error) {
      // console.error("Error adding dislike:", error);
      throw new Error(error.message || "Error adding dislike");
    }
  }
};
export const getCommentStatus = async ({ comment_id, user_id, columnName }) => {
  // console.log("Inside getCommentStatus:", { comment_id, user_id });

  if (!comment_id || !user_id || !columnName) {
    throw new Error("comment_id,columnName and user_id is required!");
  }
  const { data: likeExist } = await supabase
    .from("liked_comments")
    .select("id")
    .eq(columnName, comment_id)
    .eq("user_id", user_id);

  const { data: dislikeExist } = await supabase
    .from("disliked_comments")
    .select("id")
    .eq(columnName, comment_id)
    .eq("user_id", user_id);

  return {
    isLiked: likeExist.length > 0 ? true : false,
    isDisliked: dislikeExist.length > 0 ? true : false,
  };
};

export const getLikeCount = async ({ comment_id, columnName }) => {
  if (!comment_id || !columnName) {
    throw new Error("comment_id and columnName is required!");
  }

  const { error, count } = await supabase
    .from("liked_comments")
    .select("*", { count: "exact", head: true })
    .eq(columnName, comment_id);

  if (error) {
    throw new Error(error.message);
  }

  return count;
};

export const getDislikeCount = async ({ comment_id, columnName }) => {
  if (!comment_id || !columnName) {
    throw new Error("comment_id and columnName is required!");
  }

  const { error, count } = await supabase
    .from("disliked_comments")
    .select("*", { count: "exact", head: true })
    .eq(columnName, comment_id);

  if (error) {
    throw new Error(error.message);
  }

  return count;
};

export const fetchComment = async (comment_id) => {
  if (!comment_id) {
    throw new Error("comment_id is required!");
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*, users:profiles(first_name, last_name)")
    .eq("id", comment_id)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unknown Error.");
  }

  return data;
};
