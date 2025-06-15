import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import ConsultationButton from "@/components/Consultation/ConsultationButton";

const MainLayout = () => {
  const url = useLocation();

  const zeroPaddingPages = ["/ministries", "/consultation"];
  const isZeroPadding = zeroPaddingPages.includes(url.pathname);

  return (
    <div className="flex h-dvh flex-col">
      {/* Main content area */}
      <div className="flex flex-1 flex-col-reverse overflow-hidden bg-primary lg:flex-row">
        <Sidebar />
        <div
          className={cn(
            "no-scrollbar relative flex-1 overflow-auto bg-white px-4 pt-4 md:m-4 md:rounded-[20px] md:p-9 md:shadow-lg after:fixed after:w-full after:h-[calc(100%_-_5.8rem)] after:left-0 after:top-0 after:bg-[linear-gradient(180deg,rgba(102,63,48,0)_0%,rgba(102,63,48,0)_96%,rgba(102,63,48,0.1)_100%)] after:pointer-events-none after:content-[''] after:border-b-[1px] after:border-accent/15 after:hidden",
            { "lg:p-0": isZeroPadding }
          )}
        >
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
