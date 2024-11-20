/**
 * @module prototypes
 * @description This module contains all the prototypes for the application.
 */

// Define the default configuration for toLocaleDateString
const defaultLocale = "en-US";
const defaultOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
};

// Extend the Date prototype
Date.prototype.toDateTime = function (
  locale = defaultLocale,
  options = defaultOptions
) {
  return this.toLocaleDateString(locale, { ...defaultOptions, ...options });
};