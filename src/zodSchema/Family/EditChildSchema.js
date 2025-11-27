import { z } from "zod";
import { stringWithWhitespaceValidation } from "@/lib/validationHelpers";

export const editChildSchema = z.object({
  firstName: stringWithWhitespaceValidation("First name"),
  lastName: stringWithWhitespaceValidation("Last name"),
});
