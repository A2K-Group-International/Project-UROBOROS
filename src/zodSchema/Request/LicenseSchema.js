import z from "zod";

export const licenseSchema = z.object({
  userId: z
    .string({
      required_error: "User ID is required",
      invalid_type_error: "User ID must be a string",
    })
    .uuid({ message: "Invalid UUID format" })
    .min(1, { message: "User ID is required" }),
  groupCode: z
    .string()
    .min(1, { message: "Code is required" })
    .max(50, { message: "Code must not exceed 50 characters" }),
});

export const sendLicenseSchema = licenseSchema.pick({
  groupCode: true,
});
