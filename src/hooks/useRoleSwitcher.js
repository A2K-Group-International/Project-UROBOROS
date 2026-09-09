import { useUser } from "@/context/useUser";
import { useNavigate } from "react-router-dom";
import { ROLES } from "@/constants/roles";

const useRoleSwitcher = () => {
  const { userData } = useUser();
  const navigate = useNavigate();


  const onSwitchRole = (role) => {
    if (!userData) return;

    localStorage.setItem("temporaryRole", role);
    // setTemporaryRole(role);

    if (role === ROLES.ADMIN) {
      navigate("/ministries");
    } else {
      navigate("/announcements");
    }
  };

  const roles = [
    { label: "Switch to Parishioner", value: ROLES.PARISHIONER },
    { label: "Switch to Volunteer", value: ROLES.VOLUNTEER },
    { label: "Switch to Coordinator", value: ROLES.COORDINATOR },
    { label: "Switch to Admin", value: ROLES.ADMIN },
  ];

  const availableRoles = roles.filter((role) => {
    if (userData?.role === ROLES.VOLUNTEER) {
      if (localStorage.getItem("temporaryRole") === ROLES.VOLUNTEER) {
        // Exclude volunteer and show parishioner
        return (
          role.value !== ROLES.VOLUNTEER &&
          role.value !== ROLES.COORDINATOR &&
          role.value !== ROLES.ADMIN
        );
      }
      if (localStorage.getItem("temporaryRole") === ROLES.PARISHIONER) {
        // Exclude parishioner and show volunteer
        return (
          role.value !== ROLES.PARISHIONER &&
          role.value !== ROLES.COORDINATOR &&
          role.value !== ROLES.ADMIN
        );
      }
    } else if (userData?.role === ROLES.PARISHIONER) {
      // Do not return any role
      return null;
    } else if (userData?.role === ROLES.COORDINATOR) {
      // Returns all role except the current temporary role and superadmin
      return (
        role.value !== localStorage.getItem("temporaryRole") &&
        role?.value !== ROLES.ADMIN
      );
    } else {
      // Returns all role except the current temporary role
      return role.value !== localStorage.getItem("temporaryRole");
    }
  });
  return { availableRoles, onSwitchRole };
};

export default useRoleSwitcher;
