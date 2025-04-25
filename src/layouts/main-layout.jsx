import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const MainLayout = () => {
  const url = useLocation();

  return (
    <div className="flex h-dvh flex-col">
      {/* Main content area */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden bg-primary lg:flex-row">
        <Sidebar />
        <div
          className={cn(
            "no-scrollbar flex-1 overflow-auto bg-white p-4 md:m-4 md:rounded-[20px] md:p-9 md:shadow-lg",
            { "lg:p-0": url.pathname === "/ministries" }
          )}
        >
          <Outlet />
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
