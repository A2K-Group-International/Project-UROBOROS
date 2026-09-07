// /src/index.js (React 18 setup)
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@/index.css";
import { MAINTENANCE_MODE } from "@/constants/maintenance";
import Maintenance from "@/pages/Maintenance";

// Get the root element where React will mount the app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Public pages that stay reachable even during maintenance mode. Each entry
// is lazy-imported so nothing pulls in AppRoot's providers (Supabase/auth
// stay dormant) - only a bare BrowserRouter wraps the page.
const MAINTENANCE_ALLOWLIST = {
  "/privacy-policy": () => import("@/pages/privacy-policy-v2"),
};

const bypass = MAINTENANCE_ALLOWLIST[window.location.pathname];

if (MAINTENANCE_MODE && bypass) {
  bypass().then(({ default: Page }) => {
    root.render(
      <StrictMode>
        <BrowserRouter>
          <Page />
        </BrowserRouter>
      </StrictMode>
    );
  });
} else if (MAINTENANCE_MODE) {
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
