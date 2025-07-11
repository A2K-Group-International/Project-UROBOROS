import { SIDEBAR_LINKS } from "@/constants/sidebarLinks";
import { useUser } from "@/context/useUser";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { Link } from "react-router-dom";

const MobileNavigation = () => {
  const { userData } = useUser();
  const [navOpen, setNavOpen] = useState(false);

  const role = userData?.role;

  const toggleNav = () => {
    setNavOpen(!navOpen);
  };
  return (
    <div
      className={cn(
        `fixed bottom-10 left-1/2 z-50 flex h-fit w-full -translate-x-1/2 transform items-center justify-center lg:hidden`
      )}
    >
      <div
        className={cn(
          "z-40 flex h-[400px] w-11/12 max-w-[612px] flex-wrap content-start justify-evenly gap-4 rounded-[50px] border border-accent/20 bg-white/90 p-5 px-11 pb-20 pt-8 shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out sm:h-[300px]",
          {
            "pointer-events-none h-0 w-0 scale-95 opacity-0": !navOpen,
            "scale-100 opacity-100": navOpen,
          }
        )}
      >
        {SIDEBAR_LINKS[role]?.map((link, index) => (
          <Link
            key={link.label}
            to={link.link}
            onClick={toggleNav}
            style={{ transitionDelay: navOpen ? `${index * 30}ms` : "0ms" }}
            className={cn(
              "hover:bg-gray-200/50 relative flex flex-col items-center gap-2 text-nowrap rounded-xl p-2 text-2xs font-semibold text-accent opacity-0 transition-all duration-300",
              { "opacity-100": navOpen }
            )}
          >
            <Icon icon={link.icon} className="h-6 w-6 text-accent" />
            {link.label}
            {link.isBeta && (
              <span className="absolute -right-8 -top-2 rounded-full bg-danger px-2 py-0.5 text-[7px] font-bold text-white md:-right-10 md:-top-3 md:text-[9px]">
                BETA
              </span>
            )}
          </Link>
        ))}
      </div>
      <button
        onClick={toggleNav}
        className={cn(
          "absolute bottom-2 left-1/2 z-50 flex h-[70px] w-[88px] -translate-x-1/2 transform flex-col items-center justify-center gap-1 rounded-full border border-accent/50 bg-primary p-2 text-2xs font-bold text-accent shadow-lg transition-all duration-300 active:scale-95"
          // { "bg-primary": !navOpen, "bg-primary": navOpen }
        )}
      >
        <div className="relative h-5 w-5">
          <Icon
            className={cn("absolute h-5 w-5 transition-all duration-300", {
              "rotate-180 opacity-0": navOpen,
            })}
            icon={"mingcute:classify-fill"}
          />
          <Icon
            className={cn("absolute h-5 w-5 transition-all duration-300", {
              "-rotate-180 opacity-0": !navOpen,
            })}
            icon={"mingcute:close-fill"}
          />
        </div>
        {navOpen ? "Close" : "Menu"}
      </button>
    </div>
  );
};

export default MobileNavigation;
