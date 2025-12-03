import { z } from "zod";

/**
 * List of common placeholder/fake names to reject
 */
const INVALID_NAMES = [
  "xxx",
  "test",
  "admin",
  "user",
  "name",
  "firstname",
  "lastname",
  "asdf",
  "qwerty",
  "none",
  "null",
  "undefined",
  "n/a",
  "na",
];

export const stringWhiteSpaceValidation = (fieldName) =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .refine((val) => val.trim().length > 0, {
      message: `${fieldName} cannot be empty or whitespace only`,
    });

/**
 * Capitalizes a name properly (first letter of each word)
 * Handles hyphenated names, apostrophes, and multiple words
 * @param {string} name - The name to capitalize
 * @returns {string} Properly capitalized name
 * @example
 * capitalizeName("john") // "John"
 * capitalizeName("mary-jane") // "Mary-Jane"
 * capitalizeName("o'brien") // "O'Brien"
 * capitalizeName("mary ann") // "Mary Ann"
 */
export const capitalizeName = (name) => {
  if (!name || typeof name !== "string") return name;

  return name
    .trim()
    .toLowerCase()
    .split(/(\s|-|')/) // Split on spaces, hyphens, and apostrophes
    .map((part, index, arr) => {
      // Check if this part comes after a hyphen or apostrophe
      const prevPart = arr[index - 1];
      const shouldCapitalize =
        index === 0 || prevPart === " " || prevPart === "-" || prevPart === "'";

      if (shouldCapitalize && part.length > 0) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
      return part;
    })
    .join("");
};

/**
 * Creates a string schema with strict name validation for first/last names
 * Validates that the input is a real name with proper formatting
 * @param {string} fieldName - The name of the field for error messages
 * @param {number} minLength - Minimum length after trimming (default: 2)
 * @param {number} maxLength - Maximum length after trimming (default: 50)
 * @returns {z.ZodEffects} Zod schema with comprehensive name validation
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
    })
    .refine(
      (val) => {
        // Only allow letters, spaces, hyphens, and apostrophes
        // Supports international characters (Unicode letters)
        return /^[a-zA-Z\u00C0-\u017F\s'-]+$/.test(val);
      },
      {
        message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
      }
    )
    .refine(
      (val) => {
        // Prevent excessive repeating characters (more than 2 in a row)
        // This catches "xxx", "aaa", "zzz", etc.
        return !/(.)\1{2,}/.test(val);
      },
      {
        message: `${fieldName} cannot contain more than 2 repeating characters`,
      }
    )
    .refine(
      (val) => {
        // Check against common fake/placeholder names
        const lowerVal = val.toLowerCase().trim();
        return !INVALID_NAMES.includes(lowerVal);
      },
      {
        message: `Please enter a valid ${fieldName.toLowerCase()}`,
      }
    )
    .refine(
      (val) => {
        // Must contain at least one vowel (a, e, i, o, u)
        // Real names typically have vowels
        return /[aeiouAEIOU]/.test(val);
      },
      {
        message: `${fieldName} must contain at least one vowel`,
      }
    )
    .refine(
      (val) => {
        // Prevent names that are just spaces and special characters
        const lettersOnly = val.replace(/[\s'-]/g, "");
        return lettersOnly.length >= minLength;
      },
      {
        message: `${fieldName} must contain at least ${minLength} letters`,
      }
    );
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
