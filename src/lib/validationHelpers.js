/**
 * @module validationHelpers
 * @description Reusable validation helpers for Zod schemas
 */

import { z } from "zod";

/**
 * Creates a string schema with whitespace validation
 * @param {string} fieldName - The name of the field for error messages
 * @param {number} minLength - Minimum length after trimming
 * @param {number} maxLength - Maximum length after trimming
 * @returns {z.ZodString} Zod string schema with whitespace validation
 */
export const stringWithWhitespaceValidation = (
  fieldName,
  minLength = 2,
  maxLength = 50
) => {
  return z
    .string()
    .trim()
    .min(1, { message: `${fieldName} is required` })
    .min(minLength, {
      message: `${fieldName} must be at least ${minLength} characters`,
    })
    .max(maxLength, {
      message: `${fieldName} must not exceed ${maxLength} characters`,
    })
    .refine((val) => val.trim().length > 0, {
      message: `${fieldName} cannot be only whitespace`,
    });
};

/**
 * Validates UK phone numbers with whitespace handling
 * Accepts formats like:
 * - 07123456789
 * - +447123456789
 * - 0044 7123 456789
 * - +44 (0) 7123 456789
 * - 07123-456-789
 *
 * @returns {z.ZodEffects} Zod schema for UK phone number validation
 */
export const ukPhoneNumberValidation = () => {
  return z
    .string()
    .trim()
    .min(1, { message: "Contact number is required" })
    .refine((val) => val.trim().length > 0, {
      message: "Contact number cannot be only whitespace",
    })
    .refine(
      (val) => {
        // Remove all whitespace and common separators for validation
        const cleaned = val.replace(/[\s\-()]/g, "");
        // UK phone numbers: +44 followed by 10 digits, or 0 followed by 10 digits
        // Restrict to valid prefixes: 1 (landline), 2 (landline), 3 (UK wide), 7 (mobile), 8 (special)
        // Excludes 09 (premium), 04 (reserved), 05 (corporate), 06 (unused)
        return /^(\+44|0044|0)(1|2|3|7|8)\d{9}$/.test(cleaned);
      },
      {
        message:
          "Contact number must be a valid UK phone number (e.g., 07123456789 or +447123456789)",
      }
    );
};

/**
 * Validates UK mobile numbers specifically (starts with 07)
 * @returns {z.ZodEffects} Zod schema for UK mobile number validation
 */
export const ukMobileNumberValidation = () => {
  return z
    .string()
    .trim()
    .min(1, { message: "Mobile number is required" })
    .refine((val) => val.trim().length > 0, {
      message: "Mobile number cannot be only whitespace",
    })
    .refine(
      (val) => {
        // Remove all whitespace and common separators for validation
        const cleaned = val.replace(/[\s\-()]/g, "");
        // UK mobile numbers: +44 followed by 7 and 9 more digits, or 07 followed by 9 digits
        return /^(\+44|0044)?7\d{9}$/.test(cleaned);
      },
      {
        message:
          "Mobile number must be a valid UK mobile number (e.g., 07123456789 or +447123456789)",
      }
    );
};

/**
 * Transforms UK phone number to international format (+44)
 * Use this with .transform() after validation
 * @param {string} phoneNumber - The phone number to transform
 * @returns {string} Phone number in +44 format
 */
export const normalizeUKPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+44")) {
    return cleaned;
  }

  if (cleaned.startsWith("0044")) {
    return `+${cleaned.substring(2)}`;
  }

  if (cleaned.startsWith("0")) {
    return `+44${cleaned.substring(1)}`;
  }

  return cleaned;
};
