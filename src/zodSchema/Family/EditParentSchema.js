import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

export const editParentSchema = z.object({
  firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
  lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
  contactNumber: ukPhoneNumberValidation(),
});
