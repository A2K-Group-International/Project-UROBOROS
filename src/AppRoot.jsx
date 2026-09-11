import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import App from "@/App";
import "@/lib/prototypes";
import { UserProvider } from "@/context/UserContext";

// Create a new instance of QueryClient
const queryClient = new QueryClient();

/**
 * The full application, wrapped in QueryClientProvider, UserProvider and the
 * React Query Devtools.
 *
 * Kept separate from main.jsx so the entry point stays a bare mount and the
 * whole provider tree lives in one place.
 */
const AppRoot = () => (
  <QueryClientProvider client={queryClient}>
    {/* <SidebarProvider> */}
    <TooltipProvider>
      <UserProvider>
        <App />
        <Toaster />
      </UserProvider>
    </TooltipProvider>
    {/* </SidebarProvider> */}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default AppRoot;
