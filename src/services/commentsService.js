import { paginate } from "@/lib/utils";
import { supabase } from "./supabaseClient";

export const addComment = async ({
  comment,
  user_id,
  announcement_id,
  file,
}) => {
  if (!user_id || !announcement_id) {
    throw new Error("User ID and Post ID are required!");
  }

  let file_url, file_type, file_name;

  if (file) {
    const fileName = `${file.name.split(".")[0]}-${Date.now()}`;
    const fileExt = file.name.split(".")[1];

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Uroboros")
      .upload(`comments/${fileName}.${fileExt}`, file);

    if (uploadError) {
      throw new Error(
        `Error uploading file: ${uploadError.message || "Unknown Error."}`
      );
    }

    file_url = uploadData.path;
    file_type = file.type;
    file_name = file.name;
  }

  const { error } = await supabase.from("comment_data").insert([
    {
      comment_content: comment,
      user_id,
      entity_id: announcement_id,
      file_url,
      file_type,
      file_name,
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

  const select = " *, users(id,first_name, last_name)";
  const order = [{ column: "created_at", ascending: false }];

  const filters = {
    eq: [{ column: "entity_id", value: announcement_id }],
    is: {
      parent_id: null, // Use .is() for NULL values
    },
  };

  // With the updated paginate, `query` (for .match) and `filters` (for .eq, etc.)
  // will both be applied to the count and data queries.
  const data = await paginate({
    key: "comment_data",
    page,
    pageSize,
    query: {},
    filters,
    order,
    select,
  });

  data.items = data.items.map((item) => ({
    ...item,
    file_url: item.file_url
      ? supabase.storage.from("Uroboros").getPublicUrl(item.file_url).data
          .publicUrl
      : null,
  }));

  return data;
};

export const deleteComment = async (comment_id) => {
  if (!comment_id) {
    throw new Error("comment_id is required!");
  }

  const { error } = await supabase
    .from("comment_data")
    .delete()
    .eq("id", comment_id);

  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(error.message || "Unknown Error.");
  }
};

export const updateComment = async ({ file, comment, comment_id }) => {
  if (!comment_id) {
    throw new Error("comment_id is required!");
  }

  const { data: existingComment, error: fetchError } = await supabase
    .from("comment_data")
    .select("file_url, file_type, file_name")
    .eq("id", comment_id)
    .maybeSingle();

  if (fetchError) {
    throw new Error`Error fetching existing comment: ${fetchError.message || "Unknown Error."}`();
  }

  const { error: deleteFileError } = await supabase.storage
    .from("Uroboros")
    .remove([existingComment.file_url]);

  if (deleteFileError) {
    throw new Error`Error deleting existing file: ${deleteFileError.message || "Unknown Error."}`();
  }

  let file_url = null,
    file_type = null,
    file_name = null;

  if (file) {
    const fileName = `${file.name.split(".")[0]}-${Date.now()}`;
    const fileExt = file.name.split(".")[1];

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Uroboros")
      .upload(`comments/${fileName}.${fileExt}`, file);

    if (uploadError) {
      throw new Error(
        `Error uploading file: ${uploadError.message || "Unknown Error."}`
      );
    }

    file_url = uploadData.path;
    file_type = file.type;
    file_name = file.name;
  }

  const { error } = await supabase
    .from("comment_data")
    .update({
      comment_content: comment,
      file_url,
      file_type,
      file_name,
      edited: true,
    })
    .eq("id", comment_id);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unknown Error.");
  }
};
export const addReply = async ({
  reply,
  user_id,
  comment_id,
  announcement_id,
  file,
}) => {
  if (!user_id || !comment_id) {
    throw new Error("User ID and comment ID are required!");
  }

  let file_url = null,
    file_type = null,
    file_name = null;

  if (file) {
    const fileName = `${file.name.split(".")[0]}-${Date.now()}`;
    const fileExt = file.name.split(".")[1];

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("Uroboros")
      .upload(`replies/${fileName}.${fileExt}`, file);

    if (uploadError) {
      throw new Error(
        `Error uploading file: ${uploadError.message || "Unknown Error."}`
      );
    }

    file_url = uploadData.path;
    file_type = file.type;
    file_name = file.name;
  }

  const { error: insertError } = await supabase.from("comment_data").insert([
    {
      entity_id: announcement_id,
      comment_content: reply,
      user_id,
      parent_id: comment_id,
      file_url,
      file_type,
      file_name,
    },
  ]);

  if (insertError) {
    console.error("Supabase insert error:", insertError);
    throw new Error(insertError.message || "Unknown Error.");
  }

  const { data: commentData, error: fetchError } = await supabase
    .from("comment_data")
    .select("reply_count")
    .eq("id", comment_id)
    .single();

  if (fetchError) {
    console.error("Supabase fetch error:", fetchError);
    throw new Error(fetchError.message || "Unknown Error.");
  }

  const newReplyCount = (commentData?.reply_count || 0) + 1;

  const { error: updateError } = await supabase
    .from("comment_data")
    .update({ reply_count: newReplyCount })
    .eq("id", comment_id);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    throw new Error(updateError.message || "Unknown Error.");
  }
};

export const fetchNestedReplies = async (comment_id) => {
  if (!comment_id) {
    throw new Error("CommentID is required!");
  }

  const fetchReplies = async (id) => {
    const { data, error } = await supabase
      .from("comment_data")
      .select("*, users(*)")
      .eq("parent_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      // console.error("Supabase error:", error);
      throw new Error(error.message || "Unknown Error.");
    }

    const replies = await Promise.all(
      data.map(async (reply) => {
        const nestedReplies = await fetchReplies(reply.id);
        // Append current reply and nested replies
        reply.file_url = reply.file_url
          ? supabase.storage.from("Uroboros").getPublicUrl(reply.file_url).data
              .publicUrl
          : null;

        return [reply, ...nestedReplies];
      })
    );

    // Flatten the nested arrays into a single array
    return replies.flat();
  };

  return fetchReplies(comment_id);
};

export const deleteReply = async (comment_id) => {
  if (!comment_id) {
    throw new Error("comment_id is required!");
  }

  const { data: commentData, error: fetchError } = await supabase
    .from("comment_data")
    .select("reply_count, parent_id")
    .eq("id", comment_id)
    .single();

  if (fetchError) {
    // console.error("Supabase fetch error:", fetchError);
    throw new Error(fetchError.message || "Unknown Error.");
  }

  const parentId = commentData.parent_id;

  const { data: parentComment, error: parentFetchError } = await supabase
    .from("comment_data")
    .select("reply_count")
    .eq("id", parentId)
    .single();

  if (parentFetchError) {
    console.error("Supabase fetch error for parent comment:", parentFetchError);
    throw new Error(parentFetchError.message || "Unknown Error.");
  }

  const newReplyCount =
    parentComment.reply_count > 0 ? parseInt(parentComment.reply_count) - 1 : 0;

  const { error: updateError } = await supabase
    .from("comment_data")
    .update({ reply_count: newReplyCount })
    .eq("id", commentData.parent_id);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    throw new Error(updateError.message || "Unknown Error.");
  }

  const { error } = await supabase
    .from("comment_data")
    .delete()
    .eq("id", comment_id);

  if (error) {
    console.error("Supabase delete error:", error);
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
    .from("comment_data")
    .select("*, users(first_name, last_name)")
    .eq("id", comment_id)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message || "Unknown Error.");
  }

  return data;
};
