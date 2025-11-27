import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
} from "@/lib/validationHelpers";
import { z } from "zod";

export const newFamilySchema = z.object({
  first_name: stringWithWhitespaceValidation("First Name"),
  last_name: stringWithWhitespaceValidation("Last Name"),
  type: z.string().min(1, "Type is Required"),
  contact_number: ukPhoneNumberValidation(),
});
