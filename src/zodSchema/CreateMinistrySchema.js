import { z } from "zod";
const allowedMimeTypes = ["image/jpeg", "image/png"];

const createMinistrySchema = z.object({
  coordinators: z
    .array(z.string())
    .min(1, "At least one coordinator must be selected"),
  ministryName: z.string().min(1, "Ministry name is required"),
  ministryDescription: z
    .string()
    .max(128, "Ministry description must be 128 characters or less")
    .optional(),
  // Make ministryImage truly optional with no validation if not provided
  ministryImage: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 5 * 1024 * 1024,
          "Image size must be less than 5MB"
        )
        .refine(
          (file) => allowedMimeTypes.includes(file.type),
          "Invalid file type. Allowed: jpg, jpeg, png"
        ),
      z.string(), // For URLs
      z.null(), // For no image
      z.undefined(), // For optional
    ])
    .optional(),
});

const coordinatorSchema = createMinistrySchema.pick({
  coordinators: true,
});

export { createMinistrySchema, coordinatorSchema };
