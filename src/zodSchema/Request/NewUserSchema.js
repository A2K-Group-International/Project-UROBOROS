import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";
import { ALL_ROLES } from "@/constants/roles";

export const newUserSchema = z
  .object({
    first_name: stringWithWhitespaceValidation("First Name").transform(capitalizeName),
    last_name: stringWithWhitespaceValidation("Last Name").transform(capitalizeName),
    contact_number: ukPhoneNumberValidation(),
    email: z.string().email().min(1, "Email is Required"),
    role: z.enum(ALL_ROLES, { message: "Role is Required" }),
    password: z.string().min(6),
    confirm_password: z.string().min(6),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const editingUserSchema = z.object({
  first_name: stringWithWhitespaceValidation("First Name").transform(capitalizeName),
  last_name: stringWithWhitespaceValidation("Last Name").transform(capitalizeName),
  contact_number: ukPhoneNumberValidation(),
  role: z.enum(ALL_ROLES, { message: "Role is Required" }),
});
