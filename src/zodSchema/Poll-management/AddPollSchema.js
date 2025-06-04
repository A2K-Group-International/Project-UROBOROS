import { z } from "zod";

const AddPollSchema = z.object({
  // Step 1: Poll Name
  pollName: z.string().min(3, "Poll name must be at least 3 characters"),

  // Step 2: Poll Description
  pollDescription: z.string().min(0, ""),
});

export default AddPollSchema;
