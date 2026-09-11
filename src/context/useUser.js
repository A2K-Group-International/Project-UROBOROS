// useUser.js
import { useContext } from "react";
import UserContext from "./UserContext";

/**
 * Custom hook to access user-related data and actions.
 *
 * This hook provides access to the following user context values:
 * - `userData`: Contains the current logged-in user data (or null if not logged in).
 * - `loading`: A boolean that indicates if a login, registration, or logout operation is in progress.
 * - `login`: Function to trigger user login with credentials (email & password).
 * - `logout`: Function to trigger user logout.
 *
 * Usage:
 * 1. Wrap your component tree with the `UserProvider` component, which provides the context.
 * 2. Use this hook in any component that needs access to user data or actions.
 *
 * Example:
 * const { userData, login, logout, loading } = useUser();
 *
 * Note: If `userData` is null, the user is not logged in, and you may want to display login options or redirect them.
 */
export const useUser = () => useContext(UserContext);
