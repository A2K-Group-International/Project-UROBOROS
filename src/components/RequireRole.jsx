import { useEffect } from "react";
import PropTypes from "prop-types";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useUser } from "@/context/useUser";
import { getUser } from "@/services/userService";
import { supabase } from "@/services/supabaseClient";

const BASE_URL = import.meta.env.VITE_SUPABASE_URL;

const RequireRole = ({ roles }) => {
  const url_code = BASE_URL.split("https://")[1].split(".supabase.co")[0];
  const auth = JSON.parse(localStorage.getItem(`sb-${url_code}-auth-token`));

  const nav = useNavigate();
  const loc = useLocation();
  const { setUserData } = useUser();

  // Fetch user data based on the auth token
  const { data, isSuccess } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!auth?.user?.id) return null;
      const response = await getUser(auth?.user?.id);
      return response;
    },
    enabled: !!auth,
  });

  useEffect(() => {
    const checkAuth = async () => {
      supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          // Redirect to reset password screen
          nav("/reset-password");
          return;
        }
      });
      // Check session validity
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session && !auth) {
        nav("/", {
          replace: true,
          state: { from: loc.pathname || "/announcements" },
        });
        return;
      }
    };

    checkAuth();

    if (isSuccess && data) {
      // if (!localStorage.getItem("temporaryRole")) {
      //   localStorage.setItem("temporaryRole", data.role);
      // }
      setUserData(data);

      if (!roles.includes(data.role)) {
        nav("/announcements", { replace: true });
      }
    }

    // Ensure user is authorized based on their role
  }, [auth, data, isSuccess, roles, setUserData, nav, loc.pathname]);

  // If authorized, render child routes
  return <Outlet />;
};

RequireRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RequireRole;
