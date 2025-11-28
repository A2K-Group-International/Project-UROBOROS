import { z } from "zod";
import { ukPhoneNumberValidation } from "@/lib/validationHelpers";

// Custom validation function to check if at least one attendee is selected
const atLeastOneAttendee = (data) => {
  const { parents, children } = data;
  if (
    (!parents || parents.length === 0) &&
    (!children || children.length === 0)
  ) {
    return false;
  }
  return true;
};

// Zod schema for form validation
export const manualAttendEventsSchema = z
  .object({
    parents: z
      .array(
        z.object({
          id: z.string(), // Make sure the id is required
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          contact_number: ukPhoneNumberValidation().optional().or(z.literal("")),
          family_id: z.string().optional(),
        })
      )
      .optional(),
    children: z
      .array(
        z.object({
          id: z.string(),
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          family_id: z.string().optional(),
        })
      )
      .optional(),
  })
  .refine(atLeastOneAttendee, {
    message: "Please select at least one attendee",
    path: [],
  });
