import z from "zod";

// Define maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5MB in bytes

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "video/avi",
  "video/quicktime", // mov
  "application/pdf",
  "application/vnd.ms-powerpoint", // ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
  "application/msword", // doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
  "application/excel", // xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
];

const AnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),

  files: z
    .union([
      z.instanceof(File), // Accepts a single file
      z.array(z.instanceof(File)).max(5, "Maximum of 5 files allowed"), // Accepts multiple files
    ])
    .optional() // Make it optional if files are not required
    .refine(
      (files) =>
        Array.isArray(files)
          ? files.every((file) => file.size <= MAX_FILE_SIZE)
          : files.size <= MAX_FILE_SIZE,
      `Each file must not exceed 50MB`
    )
    .refine(
      (files) =>
        Array.isArray(files)
          ? files.every((file) => allowedMimeTypes.includes(file.type))
          : allowedMimeTypes.includes(files.type),
      "Invalid file type. Allowed: jpg, jpeg, png, gif, mp4, avi, mov, pdf, ppt, pptx, doc, docx."
    ),
});

export { AnnouncementSchema };
