import { supabase } from "./supabaseClient";
import { paginate, uploadFile } from "@/lib/utils";

const publicCreateFeedback = async (data) => {
  const { name, email, subject, description, images = [] } = data;

  const files = await Promise.all(
    images.map(async (file) => ({
      url: await uploadFile({ file, folder: "feedback" }),
      name: file.name,
    }))
  );

  const { data: id, error } = await supabase.rpc("submit_feedback", {
    p_name: name,
    p_email: email,
    p_subject: subject,
    p_description: description,
    p_files: files,
  });

  if (error) throw new Error(error.message || "Failed to submit feedback");
  return { success: true, message: "Feedback submitted successfully", details: { id } };
};

const getAllFeedback = async ({ page = 1, status = "all" }) => {
  try {
    const paginatedData = await paginate({
      key: "feedbacks",
      page,
      pageSize: 12,
      select: "*, feedback_files(id, url, name)",
      order: [{ column: "created_at", ascending: false }],
      query: status !== "all" ? { status } : {},
    });

    // Resolve stored storage paths (e.g. "feedback/<uuid>.jpg") to public URLs
    paginatedData.items = paginatedData.items.map((item) => ({
      ...item,
      feedback_files: (item.feedback_files ?? []).map((file) => ({
        ...file,
        url: supabase.storage.from("Uroboros").getPublicUrl(file.url).data
          .publicUrl,
      })),
    }));

    return paginatedData;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    throw new Error(error.message || "Failed to fetch feedbacks");
  }
};

const updateFeedbackStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("feedbacks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update feedback status", error);
    throw new Error(error.message || "Failed to update feedback status");
  }

  return {
    success: true,
    message: "Status updated successfully",
    details: data,
  };
};

export { publicCreateFeedback, getAllFeedback, updateFeedbackStatus };
