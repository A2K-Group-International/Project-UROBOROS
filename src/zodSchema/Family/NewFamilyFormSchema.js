import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
} from "@/lib/validationHelpers";
import { z } from "zod";

export const newFamilySchema = z.object({
  first_name: stringWithWhitespaceValidation("First Name"),
  last_name: stringWithWhitespaceValidation("Last Name"),
  type: z.string().min(1, "Type is Required"),
  contact_number: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "guardian") {
    const result = ukPhoneNumberValidation().safeParse(data.contact_number);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        ctx.addIssue({
          code: issue.code,
          message: issue.message,
          path: ["contact_number"],
        });
      });
    }
  }
});
