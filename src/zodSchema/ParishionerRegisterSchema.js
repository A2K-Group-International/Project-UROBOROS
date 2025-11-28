import * as z from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

export const parishionerRegisterSchema = z
  .object({
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
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(6, {
        message: "Password must be at least 6 characters.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" })
      .min(6, {
        message: "Confirm password must be at least 6 characters.",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"], // Field that has the error
        message: "Passwords must match.",
      });
    }
  });
