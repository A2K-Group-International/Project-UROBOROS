import { z } from "zod";
import { stringWithWhitespaceValidation, capitalizeName } from "@/lib/validationHelpers";

export const editChildSchema = z.object({
  firstName: stringWithWhitespaceValidation("First name").transform(capitalizeName),
  lastName: stringWithWhitespaceValidation("Last name").transform(capitalizeName),
});
