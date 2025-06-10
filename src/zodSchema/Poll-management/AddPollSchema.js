import { z } from "zod";

const AddPollSchema = z
  .object({
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

    shareMode: z.enum(["public", "ministry", "specific", "group"], {
      required_error: "Please select a share mode",
    }),

    ministryIds: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
      .default([]),

    userIds: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
      .default([]),
    groupIds: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        })
      )
      .default([]),
  })
  .refine(
    (data) => {
      // For ministry sharing mode, check ministryIds
      if (data.shareMode === "ministry") {
        return data.ministryIds.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one ministry",
      path: ["ministryIds"],
    }
  )
  .refine(
    (data) => {
      // For specific users sharing mode, check userIds
      if (data.shareMode === "specific") {
        return data.userIds.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one user",
      path: ["userIds"],
    }
  )
  .refine(
    (data) => {
      if (data.shareMode === "group") {
        return data.groupIds.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one group",
      path: ["groupIds"],
    }
  );

export default AddPollSchema;
