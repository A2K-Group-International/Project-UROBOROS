import { createContext, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  completeOAuthRegistration as completeOAuthRegistrationService,
  loginService,
  registerService,
  logoutService,
} from "@/services/userService";
import PropTypes from "prop-types";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [regData, setRegData] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const user = await loginService(credentials);
      // setUserData(user); // If we wanted to set state immediately
      return user;
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data) => {
    setLoading(true);
    try {
      const result = await registerService(data);
      setRegData(result);
      return result;
    } catch (error) {
      console.error("Registration failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Complete OAuth Registration function
  const completeOAuthRegistration = async (data) => {
    setLoading(true);
    try {
      const fullUser = await completeOAuthRegistrationService(data);
      setUserData(fullUser);
    } catch (error) {
      console.error("OAuth registration completion failed:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
      setUserData(null);
      if (sessionStorage.getItem("temp-role")) {
        sessionStorage.removeItem("temp-role");
      }
    } catch (error) {
      console.error("Logout failed:", error.message);
      throw error;
    } finally {
      // Invalidate queries related to schedules, events, and meetings
      queryClient.invalidateQueries(["schedules"]);
      queryClient.invalidateQueries(["events"]);
      queryClient.invalidateQueries(["meetings"]);

      // Optionally reset queries to clear stale data
      queryClient.resetQueries(["schedules"]);
      queryClient.resetQueries(["events"]);
      queryClient.resetQueries(["meetings"]);
      queryClient.clear(); // Clears all queries from the cache

      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userData,
        regData,
        setUserData,

        loading,
        login,
        register,
        completeOAuthRegistration,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserContext;
