/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        expand: {
          from: {
            height: "0px",
            opacity: 0,
          },
          to: {
            height: "var(--radix-collapsible-content-height)",
            opacity: 1,
          },
        },
        collapse: {
          from: {
            height: "var(--radix-collapsible-content-height)",
            opacity: 1,
          },
          to: {
            height: "0px",
            opacity: 0,
          },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        expand: "expand 0.3s ease-in-out",
        collapse: "collapse 0.3s ease-in-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        primary: "#F6F0ED",
        "primary-text": "#663E2F",
        accent: "#663F30",
        white: "#FFFFFF",
        blue: "#2394FE",
        "secondary-accent": "#F4E2D9",
        "primary-outline": "#E8DAD3",
        "primary-blue-light": "#2C4FFF",
        gray: "#E9E9E9",
        pink: "#FBCCC0",
        danger: "#FF0051",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      fontSize: {
        "2xs": "10px",
        heading: "26px",
      },
      borderColor: {
        primary: "#F1E8E4",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
