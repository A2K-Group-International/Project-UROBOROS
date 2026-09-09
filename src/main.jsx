// /src/index.js (React 18 setup)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import AppRoot from "@/AppRoot";

// Get the root element where React will mount the app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <AppRoot />
  </StrictMode>
);
