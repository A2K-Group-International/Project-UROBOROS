// /src/index.js (React 18 setup)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { MAINTENANCE_MODE } from "@/constants/maintenance";
import Maintenance from "@/pages/Maintenance";

// Get the root element where React will mount the app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

if (MAINTENANCE_MODE) {
  // Site-wide gate. Nothing below this point loads: no router, no auth, no
  // Supabase. Flip MAINTENANCE_MODE in @/constants/maintenance to restore.
  root.render(
    <StrictMode>
      <Maintenance />
    </StrictMode>
  );
} else {
  import("@/AppRoot").then(({ default: AppRoot }) => {
    root.render(
      <StrictMode>
        <AppRoot />
      </StrictMode>
    );
  });
}
