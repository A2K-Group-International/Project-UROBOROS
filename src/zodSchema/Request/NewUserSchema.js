import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
} from "@/lib/validationHelpers";

export const newUserSchema = z
  .object({
    first_name: stringWithWhitespaceValidation("First Name"),
    last_name: stringWithWhitespaceValidation("Last Name"),
    contact_number: ukPhoneNumberValidation(),
    email: z.string().email().min(1, "Email is Required"),
    role: z.string().min(1, "Role is Required"),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const editingUserSchema = z.object({
  first_name: stringWithWhitespaceValidation("First Name"),
  last_name: stringWithWhitespaceValidation("Last Name"),
  contact_number: ukPhoneNumberValidation(),
  role: z.string().min(1, "Role is Required"),
});
