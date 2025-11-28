import * as z from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

const parentSchema = z.object({
  first_name: stringWithWhitespaceValidation("First name").transform(capitalizeName),
  last_name: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
  contact_number: ukPhoneNumberValidation(),
  time_attended: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val) {
          return /^\d{2}:\d{2}$/.test(val); // Only check regex if value is present
        }
        return true; // Allow empty value
      },
      {
        message: "Time must be in HH:mm format",
      }
    ),
  time_out: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val) {
          return /^\d{2}:\d{2}$/.test(val); // Only check regex if value is present
        }
        return true; // Allow empty value
      },
      {
        message: "Time must be in HH:mm format",
      }
    ),
});

const childSchema = parentSchema.omit({ contact_number: true });

const addFamilySchema = z.object({
  parents: z
    .array(
      z.object({
        firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
        lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
        contactNumber: ukPhoneNumberValidation().refine(
          (val) => val !== "09123456789",
          "This specific number is not allowed"
        ),
      })
    )
    .min(1, "At least one parent is required"),
  children: z.array(
    z.object({
      firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
      lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
    })
  ),
});

const existingRecordSchema = z.object({
  parents: z.array(parentSchema).optional(),
  children: z.array(childSchema).min(1, "Please select at least one child"),
});

export { addFamilySchema, existingRecordSchema, childSchema, parentSchema };
