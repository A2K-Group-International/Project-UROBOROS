import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
  capitalizeName,
} from "@/lib/validationHelpers";

export const addRecordSchema = z.object({
  parents: z
    .array(
      z.object({
        parentFirstName: stringWithWhitespaceValidation("Parent's first name").transform(capitalizeName), // Parent first name is required
        parentLastName: stringWithWhitespaceValidation("Parent's last name").transform(capitalizeName), // Parent last name is required
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
        childFirstName: stringWithWhitespaceValidation("Child's first name").transform(capitalizeName), // Child first name is required
        childLastName: stringWithWhitespaceValidation("Child's last name").transform(capitalizeName), // Child last name is required
      })
    )
    .min(1, "At least one child is required"),
});
