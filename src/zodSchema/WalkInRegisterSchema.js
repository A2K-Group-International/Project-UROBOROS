import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
} from "@/lib/validationHelpers";

export const walkInRegisterSchema = z.object({
  event: z
    .string()
    .trim()
    .min(1, "Event is required")
    .refine((val) => val.trim().length > 0, {
      message: "Event cannot be only whitespace",
    }), // Event selection is required
  parents: z
    .array(
      z.object({
        parentFirstName: stringWithWhitespaceValidation("Parent's first name"), // Parent first name is required
        parentLastName: stringWithWhitespaceValidation("Parent's last name"), // Parent last name is required
        parentContactNumber: ukPhoneNumberValidation(),
        isMainApplicant: z.boolean(),
      })
    )
    .refine(
      (parents) => {
        // Ensure exactly one parent has isMainApplicant set to true
        const mainApplicants = parents.filter(
          (parent) => parent.isMainApplicant
        );
        return mainApplicants.length === 1;
      },
      {
        message: "There must be exactly one main applicant",
        path: ["parents"],
      }
    ),
  children: z
    .array(
      z.object({
        childFirstName: stringWithWhitespaceValidation("Child's first name"), // Child first name is required
        childLastName: stringWithWhitespaceValidation("Child's last name"), // Child last name is required
      })
    )
    .min(1, "At least one child is required"),
});
