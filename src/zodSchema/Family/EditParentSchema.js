import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
} from "@/lib/validationHelpers";

export const editParentSchema = z.object({
  firstName: stringWithWhitespaceValidation("First name"),
  lastName: stringWithWhitespaceValidation("Last name"),
  contactNumber: ukPhoneNumberValidation(),
});
