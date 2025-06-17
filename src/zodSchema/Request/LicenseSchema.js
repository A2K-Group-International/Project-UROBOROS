import z from "zod";

export const licenseSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email()
    .min(1, { message: "Email is required" }),
  groupCode: z
    .string()
    .min(1, { message: "Code is required" })
    .max(50, { message: "Code must not exceed 50 characters" }),
});

export const sendLicenseSchema = licenseSchema.pick({
  groupCode: true,
});
