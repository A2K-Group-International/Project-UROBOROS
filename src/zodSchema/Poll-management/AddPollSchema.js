import { z } from "zod";

const AddPollSchema = z.object({
  // Step 1: Poll Name
  pollName: z.string().min(3, "Poll name must be at least 3 characters"),

  // Step 2: Poll Description
  pollDescription: z.string().min(0, ""),

  // Step 3: Poll Dates
  pollDates: z
    .array(z.date())
    .min(1, "Please select at least one date")
    .default([]),

  // Step 4: Poll Time
  timeSlots: z
    .array(
      z.object({
        dateIndex: z.number(),
        timeIndex: z.number(),
        time: z.string(),
      })
    )
    .default([]),

  // Step 5: Poll Expiration
  pollDateExpiry: z
    .date({
      required_error: "Please select an expiration date",
      invalid_type_error: "That's not a valid date",
    })
    .nullable(),

  pollTimeExpiry: z
    .string({
      required_error: "Please select an expiration time",
    })
    .nullable(),
});

export default AddPollSchema;
