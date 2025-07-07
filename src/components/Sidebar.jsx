import { useLocation, Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
import { useUser } from "@/context/useUser";

import { Title } from "@/components/Title";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn, getInitial } from "@/lib/utils";

import { SIDEBAR_LINKS } from "@/constants/sidebarLinks";

import { ChevronUp } from "@/assets/icons/icons";
// import useRoleSwitcher from "@/hooks/useRoleSwitcher";
import { ROLES } from "@/constants/roles";

import Notification from "./Notification";
import { Loader2 } from "lucide-react";
import ConsultationButton from "./Consultation/ConsultationButton";
import { useMemo } from "react";

const Sidebar = () => {
  const url = useLocation();
  const navigate = useNavigate();
  // const { availableRoles, onSwitchRole } = useRoleSwitcher();

  const { userData, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      // localStorage.removeItem("temporaryRole");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  // Get the user's initials
  const initials = useMemo(() => {
    return `${getInitial(userData?.first_name)}${getInitial(userData?.last_name)}`;
  }, [userData?.first_name, userData?.last_name]);

  // Get the profile image URL
  const profileImageUrl = useMemo(() => {
    return userData?.profile_picture_url;
  }, [userData?.profile_picture_url]);

  // Mobile Version
  return (
    <div className="hidden lg:my-9 lg:flex lg:w-64 lg:flex-col">
      <Title className="mb-12 ml-9 max-w-[201px] lg:block">
        {userData?.role === ROLES[0] && "Coordinator Management Centre"}
        {userData?.role === ROLES[1] && "Volunteer Management Centre"}
        {(userData?.role === ROLES[2] || userData?.role === ROLES[3]) &&
          `Welcome, ${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`}
        {userData?.role === ROLES[4] && `Parish Management Centre`}
      </Title>
      <div className="no-scrollbar mb-2 flex flex-1 justify-between overflow-x-scroll md:overflow-x-visible lg:mb-0 lg:flex-col">
        <ul className="flex w-full min-w-96 items-center justify-evenly gap-0 pt-1 sm:gap-2 lg:ml-4 lg:mr-8 lg:flex-col lg:items-start">
          {userData &&
            SIDEBAR_LINKS[userData?.role]?.map((link, index) => {
              // Hide "Ministries" if temporaryRole is not equal to userData.role
              // if (
              //   link.label === "Ministries" &&
              //   localStorage.getItem("temporaryRole") !== userData?.role
              // ) {
              //   return null;
              // }
              return (
                <SidebarLink
                  key={index}
                  label={link.label}
                  link={link.link}
                  icon={link.icon}
                  selectedIcon={link.selectedIcon}
                  isActive={url.pathname === link.link}
                  isBeta={link.isBeta}
                />
              );
            })}
          <Notification isMobile={true} />
          <div className="flex flex-col items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="lg:hidden lg:px-6">
                <div className="flex items-center gap-2">
                  <Avatar
                    className={cn(
                      "h-8 w-8",
                      !profileImageUrl && "border-[3px] border-accent"
                    )}
                  >
                    <AvatarImage src={profileImageUrl} alt="profile picture" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Fetch Switch Account Base on Role */}
                {/* {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role.value}
                    onClick={() => onSwitchRole(role.value)}
                  >
                    {role.label}
                  </DropdownMenuItem>
                ))}
                {availableRoles.length > 0 && <DropdownMenuSeparator />} */}
                {/* Profile Settings, Feedback Page, Logout */}
                <Link
                  to="/feedback"
                  className="flex w-full items-center gap-2 hover:cursor-pointer"
                >
                  <DropdownMenuItem className="w-full">
                    Send Feedback
                  </DropdownMenuItem>
                </Link>
                <Link
                  to="/profile"
                  className="flex w-full items-center gap-2 hover:cursor-pointer"
                >
                  <DropdownMenuItem className="w-full">
                    Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <p className="hidden text-xs font-bold text-accent md:block lg:hidden">
              Settings
            </p>
          </div>
        </ul>
        <div className="ml-9 hidden flex-col items-start gap-y-2 lg:flex">
          <ConsultationButton isMobile={false} />
          <Notification isMobile={false} />
          <SidebarProfile
            // availableRoles={availableRoles}
            // onSwitchRole={onSwitchRole}
            initials={initials}
            profileImageUrl={profileImageUrl}
            fullName={`${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

const SidebarProfile = ({
  // availableRoles,
  // onSwitchRole,
  initials,
  profileImageUrl,
  fullName,
}) => {
  const { userData, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      // localStorage.removeItem("temporaryRole");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  if (!userData) {
    return (
      <div className="hidden h-10 w-full items-center justify-between rounded-[20px] bg-white p-1 lg:flex">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <Loader2 className="animate-spin" />
            </AvatarFallback>
          </Avatar>
          <p className="text-[16px] font-medium capitalize">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden h-10 w-full items-center justify-between rounded-[20px] bg-white p-1 lg:flex">
      <div className="flex items-center gap-1">
        {/* Avatar (Future Avatar Image) */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={profileImageUrl} alt="profile picture" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="w-32 overflow-hidden text-ellipsis text-nowrap text-[16px] font-medium capitalize text-accent">
          {fullName}
        </p>
        {/* </Link> */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-full w-10 items-center justify-center rounded-full border-none bg-accent px-2 py-1 text-white hover:cursor-pointer">
          <ChevronUp className="h-5 w-5 text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {/* {availableRoles.map((role) => (
            <DropdownMenuItem
              key={role.value}
              onClick={() => onSwitchRole(role.value)}
            >
              {role.label}
            </DropdownMenuItem>
          ))}
          {userData?.role !== ROLES[2] && <DropdownMenuSeparator />} */}
          <Link
            to="/send-feedback"
            className="flex w-full items-center gap-2 hover:cursor-pointer"
          >
            <DropdownMenuItem className="w-full">
              Send Feedback
            </DropdownMenuItem>
          </Link>
          <Link
            to="/profile"
            className="flex w-full items-center gap-2 hover:cursor-pointer"
          >
            <DropdownMenuItem className="w-full">Profile</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const SidebarLink = ({ label, link, icon, selectedIcon, isActive, isBeta }) => {
  return (
    <div className="w-16 md:w-16 lg:w-fit">
      <li
        className={cn(
          "flex items-center justify-center rounded-3xl p-2 lg:justify-start lg:px-6",
          isActive ? "bg-accent text-primary" : "text-accent"
        )}
      >
        <Link
          to={link}
          className="relative flex items-center justify-center text-[16px] font-medium lg:gap-2"
        >
          <Icon icon={isActive ? selectedIcon : icon} className="h-5 w-5" />
          <p className="hidden lg:block">{label}</p>
          {isBeta && (
            <span className="absolute -right-7 -top-2 rounded-full bg-danger px-2 py-0.5 text-[7px] font-bold text-white md:-right-10 md:-top-3 md:text-[9px]">
              BETA
            </span>
          )}
        </Link>
      </li>
      <div className="mt-1 flex flex-col items-center justify-center sm:mt-0 lg:hidden">
        <p className="text-center text-[8px] font-bold text-accent">{label}</p>
      </div>
    </div>
  );
};

SidebarLink.propTypes = {
  label: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  selectedIcon: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  isBeta: PropTypes.bool,
};

SidebarProfile.propTypes = {
  availableRoles: PropTypes.array,
  onSwitchRole: PropTypes.func,
  initials: PropTypes.string.isRequired,
  profileImageUrl: PropTypes.string,
  fullName: PropTypes.string.isRequired,
};

export { SidebarLink, SidebarProfile };
