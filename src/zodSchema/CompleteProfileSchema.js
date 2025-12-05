import * as z from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

export const completeProfileSchema = z.object({
  firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
  lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
  contactNumber: ukPhoneNumberValidation(),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({
      message: "Please enter a valid email address.",
    }),
});
