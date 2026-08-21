import { Wrench } from "lucide-react";
import { MAINTENANCE_CONTACT_EMAIL } from "@/constants/maintenance";

/**
 * Site-wide maintenance screen.
 *
 * Rendered from src/main.jsx in place of the whole application, so it must
 * stay self-contained: no router, no Supabase, no context providers. It has
 * to render even when every backend service is unavailable.
 */
const Maintenance = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#FFDECE] font-montserrat">
      {/* Brand backdrop, matching the portal's front door */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('@/assets/svg/backdrop_clean.svg')] bg-bottom bg-no-repeat md:bg-center lg:bg-cover"
      />

      {/* Saint Laurence figure, tucked into the corner on wider screens */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-[6vw] hidden h-[58vh] w-[18vh] bg-[url('@/assets/svg/st_laurence.svg')] bg-contain bg-bottom bg-no-repeat opacity-80 lg:block"
      />

      {/* Softens the artwork behind the card so the copy stays legible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFDECE]/80 via-[#FFDECE]/50 to-[#FFDECE]/80"
      />

      {/* index.css locks scrolling on html/body, so the page scrolls here */}
      <div className="no-scrollbar relative z-10 h-full overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6">
          <main className="w-full max-w-lg rounded-2xl border border-primary-outline bg-white/95 p-8 text-center shadow-xl backdrop-blur-sm sm:p-10">
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-pulse rounded-full bg-secondary-accent motion-reduce:animate-none"
              />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary-accent">
                <Wrench className="h-7 w-7 text-accent" aria-hidden="true" />
              </span>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent/70">
              Saint Laurence Parish Portal
            </p>

            <h1 className="mb-3 text-2xl font-bold text-primary-text sm:text-3xl">
              We&rsquo;ll be back shortly
            </h1>

            <p className="text-balance leading-relaxed text-primary-text/80">
              The portal is temporarily unavailable while we carry out
              maintenance. Thank you for your patience &mdash; please check back
              soon.
            </p>

            <div className="mt-8 border-t border-primary-outline pt-6">
              <p className="text-sm text-primary-text/70">
                Need to reach us in the meantime?
              </p>
              <a
                href={`mailto:${MAINTENANCE_CONTACT_EMAIL}`}
                className="mt-1 inline-block break-all text-sm font-semibold text-accent underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                {MAINTENANCE_CONTACT_EMAIL}
              </a>
            </div>
          </main>
        </div>
      </div>

      <footer className="pointer-events-none absolute bottom-0 z-20 w-full px-6 py-3 text-center">
        <p className="text-2xs font-light text-primary-text/50">
          Developed by A2K Group Corporation &copy; {currentYear}
        </p>
      </footer>
    </div>
  );
};

export default Maintenance;
