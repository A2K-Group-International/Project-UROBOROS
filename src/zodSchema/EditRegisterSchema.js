import { z } from "zod";
import {
  stringWithWhitespaceValidation,
  ukPhoneNumberValidation,
} from "@/lib/validationHelpers";

export const EditRegisterSchema = z.object({
  event: z.string().min(1, "Event is required"), // Event selection is required
  eventId: z.string().uuid("Event ID must be a valid UUID"), // Event ID must be a valid UUID
  ticketCode: z.string().min(1, "Ticket code is required"), // Ticket code is required
  parents: z
    .array(
      z.object({
        parentFirstName: stringWithWhitespaceValidation("Parent's first name"), // Parent first name is required
        parentLastName: stringWithWhitespaceValidation("Parent's last name"), // Parent last name is required
        parentContactNumber: ukPhoneNumberValidation(),
        isMainApplicant: z.boolean(),
        id: z.string().uuid("Parent ID must be a valid UUID").optional(), // ID is optional for updates
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
        id: z.string().uuid("Child ID must be a valid UUID").optional(), // ID is optional for updates
      })
    )
    .min(1, "At least one child is required"),
  removedParents: z
    .array(
      z.object({
        id: z.string().uuid("Parent ID must be a valid UUID"), // ID is required for removal
      })
    )
    .optional(), // Optional field to track removed parents
  removedChildren: z
    .array(
      z.object({
        id: z.string().uuid("Child ID must be a valid UUID"), // ID is required for removal
      })
    )
    .optional(), // Optional field to track removed children
});
