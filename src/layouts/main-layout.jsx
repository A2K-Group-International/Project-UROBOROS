import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { cn, getInitial } from "@/lib/utils";
import ConsultationButton from "@/components/Consultation/ConsultationButton";
import MobileNavigation from "@/components/MobileNavigation";
import Notification from "@/components/Notification";
import { useUser } from "@/context/useUser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLES } from "@/constants/roles";

const MainLayout = () => {
  const url = useLocation();
  const { userData, logout } = useUser();

  // Get the user's initials
  const initials = () => {
    return `${getInitial(userData?.first_name)}${getInitial(userData?.last_name)}`;
  };

  // Get the profile image URL
  const profileImageUrl = () => {
    return userData?.profile_picture_url;
  };
  const handleLogout = async () => {
    try {
      await logout();
      Navigate("/", { replace: true });
      // localStorage.removeItem("temporaryRole");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };
  const zeroPaddingPages = ["/ministries", "/consultation"];
  const isZeroPadding = zeroPaddingPages.includes(url.pathname);

  return (
    <div className="flex h-dvh w-full flex-col">
      {/* Main content area */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden bg-primary lg:flex-row">
        <MobileNavigation />
        <Sidebar />
        <div
          className={cn(
            "no-scrollbar relative flex-1 overflow-auto bg-white px-4 pt-4 md:m-4 md:rounded-[20px] md:p-9 md:shadow-lg",
            { "lg:p-0": isZeroPadding }
          )}
        >
          <div className="z-50 flex items-center justify-between gap-3 lg:hidden">
            <div className="text-xl font-bold text-accent">
              {userData?.role === ROLES[0] && "Coordinator Management Centre"}
              {userData?.role === ROLES[1] && "Volunteer Management Centre"}
              {(userData?.role === ROLES[2] || userData?.role === ROLES[3]) &&
                `Welcome, ${userData?.first_name ?? ""} ${userData?.last_name ?? ""}`}
              {userData?.role === ROLES[4] && `Parish Management Centre`}
            </div>
            <div className="flex items-center gap-4">
              <Notification isMobile={true} />
              <DropdownMenu>
                <DropdownMenuTrigger className="lg:hidden lg:px-6">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={profileImageUrl}
                        alt="profile picture"
                      />
                      <AvatarFallback>{initials()}</AvatarFallback>
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
                  <DropdownMenuItem onClick={() => handleLogout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Outlet />
        </div>
        <div
          className={cn("absolute bottom-28 right-5 z-50", {
            hidden:
              url.pathname === "/consultation" || url.pathname === "/profile",
          })}
        >
          <ConsultationButton isMobile={true} />
        </div>
      </div>

      {/* Footer */}
      <div className="z-10 flex h-[1.8rem] w-full items-center border-t border-gray/10 bg-[#663F30] pl-4">
        <p className="font-regular text-[0.55rem] text-[#FBCCC0]/40 md:text-[0.7rem]">
          Developed by{" "}
          <a
            href="http://a2kgroup.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            A2K Group Corporation <span> © {new Date().getFullYear()}</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default MainLayout;
