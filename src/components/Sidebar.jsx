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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn, getInitial } from "@/lib/utils";

import { SIDEBAR_LINKS } from "@/constants/sidebarLinks";

import { ChevronUp } from "@/assets/icons/icons";
import useRoleSwitcher from "@/hooks/useRoleSwitcher";
import { ROLES } from "@/constants/roles";
import { useState } from "react";

const Sidebar = () => {
  const url = useLocation();
  const navigate = useNavigate();
  const { availableRoles, onSwitchRole, temporaryRole } = useRoleSwitcher();

  const { userData, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      localStorage.removeItem("temporaryRole");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const initials = `${getInitial(userData?.first_name)}${getInitial(userData?.last_name)}`;
  // Mobile Version
  return (
    <div className="flex lg:my-9 lg:w-64 lg:flex-col">
      <Title className="mb-12 ml-9 hidden max-w-[201px] lg:block">
        {temporaryRole === ROLES[0] && "Coordinator Management Centre"}
        {temporaryRole === ROLES[1] && "Volunteer Management Centre"}
        {(temporaryRole === ROLES[2] || temporaryRole === ROLES[3]) &&
          `Welcome, ${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`}
        {temporaryRole === ROLES[4] && `Parish Management Centre`}
      </Title>
      <div className="mb-2 flex flex-1 justify-between lg:mb-0 lg:flex-col">
        <ul className="flex w-full items-center justify-evenly gap-0 pt-1 sm:gap-2 lg:ml-4 lg:mr-8 lg:flex-col lg:items-start">
          {userData &&
            SIDEBAR_LINKS[temporaryRole]?.map((link, index) => {
              // Hide "Ministries" if temporaryRole is not equal to userData.role
              if (
                link.label === "Ministries" &&
                temporaryRole !== userData?.role
              ) {
                return null;
              }
              return (
                <SidebarLink
                  key={index}
                  label={link.label}
                  link={link.link}
                  icon={link.icon}
                  selectedIcon={link.selectedIcon}
                  isActive={url.pathname === link.link}
                />
              );
            })}
          <div className="flex flex-col items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="lg:hidden lg:px-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border-[3px] border-accent">
                    <AvatarImage
                      src={userData?.user_image ?? ""}
                      alt="profile picture"
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {/* Fetch Switch Account Base on Role */}
                {availableRoles.map((role) => (
                  <DropdownMenuItem
                    key={role.value}
                    onClick={() => onSwitchRole(role.value)}
                  >
                    {role.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
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
          <Notification />
          <SidebarProfile
            availableRoles={availableRoles}
            onSwitchRole={onSwitchRole}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

const SidebarProfile = ({ availableRoles, onSwitchRole }) => {
  const { userData, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      localStorage.removeItem("temporaryRole");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  if (!userData) {
    return (
      <div className="hidden h-10 max-w-56 items-center justify-between rounded-[20px] bg-white p-1 lg:flex">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
          <p className="text-[16px] font-medium capitalize">Loading...</p>
        </div>
      </div>
    );
  }

  const initials = `${getInitial(userData?.first_name ?? "U")}${getInitial(userData?.last_name ?? "")}`;
  const fullName =
    `${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`.trim() ||
    "Guest";

  return (
    <div className="hidden h-10 w-56 items-center justify-between rounded-[20px] bg-white p-1 lg:flex">
      <div className="flex items-center gap-2">
        {/* Avatar (Future Avatar Image) */}
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <p className="w-32 overflow-hidden text-ellipsis text-nowrap text-[16px] font-medium capitalize">
          {fullName}
        </p>
        {/* </Link> */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-2 flex h-7 w-11 items-center justify-center rounded-[18.5px] bg-accent px-2 text-white hover:cursor-pointer">
          <ChevronUp className="h-5 w-5 text-white" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableRoles.map((role) => (
            <DropdownMenuItem
              key={role.value}
              onClick={() => onSwitchRole(role.value)}
            >
              {role.label}
            </DropdownMenuItem>
          ))}
          {userData?.role !== ROLES[2] && <DropdownMenuSeparator />}
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

const SidebarLink = ({ label, link, icon, selectedIcon, isActive }) => {
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
          className="flex items-center justify-center text-[16px] font-medium lg:gap-2"
        >
          <Icon icon={isActive ? selectedIcon : icon} className="h-5 w-5" />
          <p className="hidden lg:block">{label}</p>
        </Link>
      </li>
      <p className="mt-1 text-center text-[8px] font-bold text-accent sm:mt-0 lg:hidden">
        {label}
      </p>
    </div>
  );
};

SidebarLink.propTypes = {
  label: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  selectedIcon: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
};

SidebarProfile.propTypes = {
  availableRoles: PropTypes.array,
  onSwitchRole: PropTypes.func,
};

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full select-none">
      <div
        className="flex h-10 cursor-pointer items-center justify-between rounded-full bg-white p-1 text-[16px] font-medium text-accent"
        onClick={handleToggle}
      >
        <div className="flex w-full items-center gap-x-2">
          <Icon icon="mingcute:notification-line" className="h-6 w-6" />
          <span>Notifications</span>
        </div>
        <span className="w-11 rounded-full bg-red-500 text-center text-white">
          3
        </span>
      </div>
      {isOpen && (
        <div className="absolute bottom-0 left-[14rem] z-50 h-[36rem] w-[40rem] rounded-2xl bg-white drop-shadow-xl">
          test
        </div>
      )}
    </div>
  );
};

export { SidebarLink, SidebarProfile };
