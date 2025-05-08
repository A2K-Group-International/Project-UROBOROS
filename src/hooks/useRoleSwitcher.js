import { useUser } from "@/context/useUser";
import { useNavigate } from "react-router-dom";
import { ROLES } from "@/constants/roles";

const useRoleSwitcher = () => {
  const { userData } = useUser();
  const navigate = useNavigate();

  // const [temporaryRole, setTemporaryRole] = useState(
  //   localStorage.getItem("temporaryRole")
  // );

  // useEffect(() => {
  //   if (userData?.role) {
  //     localStorage.setItem("temporaryRole", userData.role);
  //   }
  // }, [userData?.role]);

  const onSwitchRole = (role) => {
    if (!userData) return;

    localStorage.setItem("temporaryRole", role);
    // setTemporaryRole(role);

    if (role === ROLES[4]) {
      navigate("/ministries");
    } else {
      navigate("/announcements");
    }
  };

  const roles = [
    { label: "Switch to Parishioner", value: ROLES[2] },
    { label: "Switch to Volunteer", value: ROLES[1] },
    { label: "Switch to Coordinator", value: ROLES[0] },
    { label: "Switch to Admin", value: ROLES[4] },
  ];

  const availableRoles = roles.filter((role) => {
    if (userData?.role === ROLES[1]) {
      if (localStorage.getItem("temporaryRole") === ROLES[1]) {
        // Exclude volunteer and show parishioner
        return (
          role.value !== ROLES[1] &&
          role.value !== ROLES[0] &&
          role.value !== ROLES[4]
        );
      }
      if (localStorage.getItem("temporaryRole") === ROLES[2]) {
        // Exclude parishioner and show volunteer
        return (
          role.value !== ROLES[2] &&
          role.value !== ROLES[0] &&
          role.value !== ROLES[4]
        );
      }
    } else if (userData?.role === ROLES[2]) {
      // Do not return any role
      return null;
    } else if (userData?.role === ROLES[0]) {
      // Returns all role except the current temporary role and superadmin
      return (
        role.value !== localStorage.getItem("temporaryRole") &&
        role?.value !== ROLES[4]
      );
    } else {
      // Returns all role except the current temporary role
      return role.value !== localStorage.getItem("temporaryRole");
    }
  });
  return { availableRoles, onSwitchRole };
};

export default useRoleSwitcher;
