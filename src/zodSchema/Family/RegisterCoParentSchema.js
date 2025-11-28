import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

export const registerCoParentSchema = z
  .object({
    firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
    lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
    contactNumber: ukPhoneNumberValidation(),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email is required" })
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" })
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
