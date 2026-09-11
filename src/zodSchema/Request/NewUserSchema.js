import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";
import { ALL_ROLES } from "@/constants/roles";

export const editingUserSchema = z.object({
  first_name: stringWithWhitespaceValidation("First Name").transform(capitalizeName),
  last_name: stringWithWhitespaceValidation("Last Name").transform(capitalizeName),
  mobile_number: ukPhoneNumberValidation(),
  role: z.enum(ALL_ROLES, { message: "Role is Required" }),
});
