import { z } from "zod";

export const editMinistrySchema = z.object({
  ministryId: z.string().min(1, "Ministry ID is required"), // Add ministryId as a required string
  ministryName: z.string().min(1, "Ministry name is required"),
  ministryDescription: z.string().optional(),
});