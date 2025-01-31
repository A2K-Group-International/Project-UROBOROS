import * as z from "zod";

 const parentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  contact_number: z.string().regex(/^[0-9]{11}$/, {
    message: "Contact number must be exactly 11 digits.",
  }),
});
 const childSchema = parentSchema.omit({ contact_number: true });

 const addFamilySchema = z.object({
  parents: z.array(parentSchema).min(1, "At least one parent is required"),
  children: z.array(childSchema),
});

const existingRecordSchema = z.object({
  parents: z.array(parentSchema).optional(), 
  children: z.array(childSchema).min(1, "Please select at least one child"),
});



export {
  addFamilySchema,
  existingRecordSchema,
  childSchema,
  parentSchema
}