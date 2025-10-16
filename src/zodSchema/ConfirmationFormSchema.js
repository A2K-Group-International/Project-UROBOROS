import { z } from "zod";

export const registrationSchema = z
  .object({
    // Email (already have this - will be passed as prop)
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),

    // Candidate Details
    full_name: z.string().min(1, "Full name is required"),
    preferred_name: z.string().optional(),
    address: z.string().min(1, "Address is required"),
    date_of_birth: z.date({
      required_error: "Date of birth is required",
      invalid_type_error: "Please select a valid date",
    }),

    // Mass Attendance
    mass_location: z.string().min(1, "Please select where you attend Mass"),
    mass_location_other: z.string().optional(),

    // Baptism Information
    baptism_date: z.date({
      required_error: "Baptism date is required",
      invalid_type_error: "Please select a valid date",
    }),
    baptism_place: z.string().min(1, "Place of baptism is required"),
    baptism_church_address: z.string().optional(),

    // Medical & Additional Needs
    medical_conditions: z.string().optional(),
    additional_needs: z.string().optional(),

    // Parent/Guardian Details
    main_contact_name: z.string().min(1, "Main contact name is required"),
    candidate_relationship: z
      .string()
      .min(1, "Please select your relationship to the candidate"),
    candidate_relationship_other: z.string().optional(),
    mobile_number: z
      .string()
      .trim()
      .min(1, { message: "Contact number is required" })
      .regex(/^(\+44|0)7\d{9}$/, {
        message:
          "Must be a valid UK mobile number (e.g., +447123456789 or 07123456789)",
      })
      .transform((val) => (val.startsWith("0") ? `+44${val.slice(1)}` : val)),

    // Sponsor Details
    sponsor_name: z.string().optional(),
    sponsor_email: z
      .string()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: "Invalid email address",
      }),
    sponsor_baptised: z.string().optional(),
    preferred_contact: z
      .array(z.string())
      .min(1, "Please select at least one contact method")
      .refine(
        (val) =>
          val.every((method) =>
            ["Email", "Telephone call", "WhatsApp group", "Text"].includes(
              method
            )
          ),
        "Invalid contact method selected"
      ),
    permission_types: z
      .array(z.string())
      .min(1, "Please select at least one permission type")
      .refine(
        (val) =>
          val.every((type) =>
            [
              "Confirmation Group",
              "Ablaze Mass",
              "Other Parish-based Youth Activities",
              "Ignite Youth Team - Diocese of East Anglia",
            ].includes(type)
          ),
        "Invalid permission type selected"
      ),
  })
  .refine(
    (data) => {
      // If mass_location is "Other", then mass_location_other is required
      if (data.mass_location === "Other") {
        return (
          data.mass_location_other && data.mass_location_other.trim().length > 0
        );
      }
      return true; // If not "Other", validation passes
    },
    {
      message: "Please specify other location",
      path: ["mass_location_other"], // This tells Zod which field to show the error on
    }
  )
  .refine(
    (data) => {
      // If candidate_relationship is "Other", then candidate_relationship_other is required
      if (data.candidate_relationship === "Other") {
        return (
          data.candidate_relationship_other &&
          data.candidate_relationship_other.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please specify other relationship",
      path: ["candidate_relationship_other"],
    }
  );
