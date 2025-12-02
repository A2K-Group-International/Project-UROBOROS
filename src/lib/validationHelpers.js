import { z } from "zod";

export const stringWithWhitespaceValidation = (fieldName) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => val.trim().length > 0, {
      message: `${fieldName} cannot be empty or whitespace only`,
    });
