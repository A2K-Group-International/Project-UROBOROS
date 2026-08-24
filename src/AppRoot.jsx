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
 * This lives outside main.jsx so it can be loaded dynamically: while the site
 * is in maintenance mode nothing in this module tree is imported, which keeps
 * the Supabase client (created at module scope in @/services/supabaseClient)
 * from booting and refreshing auth tokens behind the maintenance screen.
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
