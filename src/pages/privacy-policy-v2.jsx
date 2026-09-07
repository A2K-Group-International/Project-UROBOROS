import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import PropTypes from "prop-types";
import LandingLayout from "@/layouts/Landing-Layout";

const TOC_ITEMS = [
  { id: "at-a-glance", title: "At a glance" },
  { id: "section-1", title: "1. Who is responsible for your information?" },
  { id: "section-2", title: "2. Who does this notice cover?" },
  { id: "section-3", title: "3. What information do we collect or use?" },
  { id: "section-4", title: "4. How do we obtain information?" },
  {
    id: "section-5",
    title: "5. Why do we use information, and what is our lawful basis?",
  },
  {
    id: "section-6",
    title: "6. Special-category and safeguarding information",
  },
  {
    id: "section-7",
    title: "7. What information is required, and what choices do you have?",
  },
  { id: "section-8", title: "8. Who can see information?" },
  { id: "section-9", title: "9. Who do we share information with?" },
  { id: "section-10", title: "10. International transfers" },
  { id: "section-11", title: "11. How long do we keep information?" },
  {
    id: "section-12",
    title: "12. Account deletion and information outside our control",
  },
  { id: "section-13", title: "13. How do we protect information?" },
  { id: "section-14", title: "14. Children's information" },
  {
    id: "section-15",
    title: "15. Automated decision-making, advertising, and sale",
  },
  { id: "section-16", title: "16. Your data-protection rights" },
  { id: "section-17", title: "17. Complaints" },
];

const AT_A_GLANCE_ITEMS = [
  "We use identity and contact information to create and secure accounts and provide app features.",
  "Community activity may be visible to authorised members, leaders, volunteers, or administrators, depending on the feature and your role.",
  "The app can contain children’s information and information revealing religion or ethnicity, which receives additional protection.",
  "We do not sell personal information or use the current app to serve third-party targeted advertising.",
  "You can control optional information and notifications and can ask to exercise your data-protection rights.",
];

const tocLinkClass = (isActive, variant) => {
  if (variant === "mobile") {
    return `block py-1.5 text-sm ${
      isActive
        ? "font-medium text-accent"
        : "text-gray-600 dark:text-gray-300"
    }`;
  }
  return `-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${
    isActive
      ? "border-accent font-medium text-accent"
      : "border-transparent text-gray-600 hover:text-primary-text dark:text-gray-300"
  }`;
};

const TocLinks = ({ activeId, onNavigate, variant }) => (
  <ul
    className={
      variant === "mobile" ? "space-y-1" : "space-y-1 border-l border-primary-outline"
    }
  >
    {TOC_ITEMS.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          onClick={onNavigate(item.id)}
          className={tocLinkClass(activeId === item.id, variant)}
        >
          {item.title}
        </a>
      </li>
    ))}
  </ul>
);

TocLinks.propTypes = {
  activeId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["desktop", "mobile"]).isRequired,
};

const DesktopToc = ({ activeId, onNavigate }) => (
  <nav
    aria-label="Table of contents"
    className="hidden lg:block lg:w-[220px] lg:shrink-0 lg:min-h-0 lg:overflow-y-auto lg:pr-4"
  >
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-accent/70">
      On this page
    </p>
    <TocLinks activeId={activeId} onNavigate={onNavigate} variant="desktop" />
  </nav>
);

DesktopToc.propTypes = {
  activeId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

const MobileToc = ({ activeId, onNavigate, open, onToggle }) => (
  <div className="mb-8 rounded-lg border border-primary-outline bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 lg:hidden">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-primary-text dark:text-gray-100"
    >
      On this page
      <Icon
        icon="mingcute:down-line"
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
      />
    </button>
    {open && (
      <div className="max-h-[50dvh] overflow-y-auto border-t border-primary-outline px-4 py-3">
        <TocLinks activeId={activeId} onNavigate={onNavigate} variant="mobile" />
      </div>
    )}
  </div>
);

MobileToc.propTypes = {
  activeId: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

const AtAGlanceSummary = () => (
  <div
    id="at-a-glance"
    className="mb-10 scroll-mt-8 rounded-lg border border-primary-outline bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
  >
    <div className="flex items-center gap-3 border-b border-primary-outline p-6 pb-4 dark:border-neutral-800">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-accent">
        <Icon icon="mingcute:information-line" className="h-5 w-5 text-accent" />
      </span>
      <h2 className="text-xl font-semibold text-primary-text dark:text-gray-100">
        At a glance
      </h2>
    </div>
    <ul className="space-y-3 p-6 pt-4">
      {AT_A_GLANCE_ITEMS.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <Icon
            icon="mingcute:check-circle-fill"
            className="mt-0.5 h-5 w-5 shrink-0 text-accent"
          />
          <span className="text-lg text-gray-600 dark:text-gray-300">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const Section = ({ id, title, icon, children }) => (
  <section
    id={id}
    className="mt-10 scroll-mt-8 border-t border-primary-outline pt-8"
  >
    <h2 className="mb-4 flex items-center gap-3 text-2xl font-semibold text-primary-text dark:text-gray-100">
      <Icon icon={icon} className="h-6 w-6 shrink-0 text-accent" />
      {title}
    </h2>
    {children}
  </section>
);

Section.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const Callout = ({ children }) => (
  <div className="rounded-md border border-primary-outline bg-primary/40 p-4">
    {children}
  </div>
);

Callout.propTypes = {
  children: PropTypes.node.isRequired,
};

const PrivacyPolicyV2 = () => {
  const containerRef = useRef(null);
  const [activeId, setActiveId] = useState(TOC_ITEMS[0].id);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return undefined;

    const headingEls = TOC_ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter(Boolean);
    const visibleIds = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });
        if (visibleIds.size > 0) {
          const topMost = TOC_ITEMS.find((item) => visibleIds.has(item.id));
          if (topMost) setActiveId(topMost.id);
        }
      },
      { root, rootMargin: "0px 0px -70% 0px", threshold: 0 }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ block: "start" });
    });
  }, []);

  const handleNavigate = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
    }
    setMobileTocOpen(false);
  };

  return (
    <LandingLayout>
      <div className="container mx-auto flex h-dvh flex-col px-4 pt-16">
        <div className="shrink-0 pb-6">
          <div className="mb-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-primary-outline bg-white px-4 py-2 text-sm font-medium text-primary-text shadow-sm transition-colors hover:bg-secondary-accent hover:text-accent dark:border-neutral-800 dark:bg-neutral-950 dark:text-gray-100"
            >
              <Icon icon="mingcute:arrow-left-line" className="h-4 w-4" />
              Back to Home
            </a>
          </div>

          <h1 className="mb-3 text-4xl font-bold text-primary-text dark:text-gray-100">
            Saint Laurence Portal Privacy Notice
          </h1>
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-accent px-3 py-1 text-sm font-medium text-accent">
              <Icon icon="mingcute:calendar-line" className="h-4 w-4" />
              Last updated: 7 September 2026
            </span>
          </div>

          <MobileToc
            activeId={activeId}
            onNavigate={handleNavigate}
            open={mobileTocOpen}
            onToggle={() => setMobileTocOpen((prev) => !prev)}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch lg:gap-12">
          <DesktopToc activeId={activeId} onNavigate={handleNavigate} />

          <div
            ref={containerRef}
            className="no-scrollbar min-h-0 flex-1 overflow-y-scroll pb-16 lg:min-w-0"
          >
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
              This notice explains how personal information is used through the
              Saint Laurence, the related ToGather platform, and the account,
              support, and enquiry services connected with www.togather.org.uk.
              &ldquo;Personal information&rdquo; means information relating to
              an identified or identifiable person.
            </p>

            <AtAGlanceSummary />

            <Section
              id="section-1"
              title="1. Who is responsible for your information?"
              icon="mingcute:idcard-line"
            >
              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                TO-GATHER C.I.C.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                TO-GATHER C.I.C. (&ldquo;ToGather&rdquo;, &ldquo;we&rdquo;,
                &ldquo;us&rdquo;) is the controller for personal information it
                uses to create and administer platform accounts, secure and
                operate the platform, provide support, handle website
                enquiries, and meet its own legal obligations.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                TO-GATHER C.I.C. is a community interest company registered in
                England and Wales under company number 16358298. Its
                registered office and privacy contact are:
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                TO-GATHER C.I.C.
                <br />
                167&ndash;169 Great Portland Street
                <br />
                London W1W 5PF
                <br />
                United Kingdom
                <br />
                Email: info@togather.org.uk
                <br />
                Telephone: +44 7858 698815
              </p>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Your participating organisation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                The participating organisation &mdash; St. Laurence&rsquo;s
                Roman Catholic Church, 91 Milton Road, Cambridge CB4 1XB (part
                of the Diocese of East Anglia; Registered Charity No. 278742)
                &mdash; is normally the controller for the community
                information it decides to collect and use, including family
                relationships, groups, ministries, events, volunteering,
                attendance, posts, and documents. You can contact the Parish
                Office at office@saintlaurence.org.uk or on 01223 987091.
                ToGather processes that information on its documented
                instructions.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                If you are unsure who is responsible, contact
                info@togather.org.uk. We will help route your request to the
                correct organisation.
              </p>
            </Section>

            <Section
              id="section-2"
              title="2. Who does this notice cover?"
              icon="mingcute:group-3-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                This notice covers account holders, invited guardians, family
                members and children whose information is added, community
                members, volunteers, event attendees, people who contact
                support, and people who submit an enquiry or demo request
                through www.togather.org.uk.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                External websites, social-login providers, app stores, and
                apps to which you choose to export or share information have
                their own privacy notices. A separate cookie notice explains
                cookies or similar technologies used on www.togather.org.uk.
              </p>
            </Section>

            <Section
              id="section-3"
              title="3. What information do we collect or use?"
              icon="mingcute:file-info-line"
            >
              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Account and identity information
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  First name, last name, full name, email address, UK mobile
                  number, account ID, role, account status, login method, and
                  authentication records.
                </li>
                <li>
                  If you sign in with Apple, Google, or Microsoft, identifiers
                  and profile information that the provider releases with
                  your permission.
                </li>
              </ul>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Profile information
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Profile photograph and optional date of birth, gender, and
                  ethnicity.
                </li>
                <li>
                  Information inferred from participation. For example,
                  church, ministry, group, volunteering, or attendance
                  records may reveal religious beliefs.
                </li>
              </ul>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Family and children&rsquo;s information
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Guardian names, mobile numbers or invitation email
                  addresses; relationships between accounts; family
                  membership; and children&rsquo;s first and last names.
                </li>
                <li>
                  Registration and attendance information relating to adults
                  and children, including walk-in attendees entered by an
                  authorised user.
                </li>
              </ul>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Community, event, and attendance information
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Organisation role, ministry and group membership,
                  coordinator or volunteer assignments, event registrations,
                  who made an assignment or registration, and relevant dates
                  and times.
                </li>
                <li>
                  Event and attendance records, including event, attendee
                  name and type, mobile number where supplied, registration
                  or ticket code, status, time in and time out, and the
                  person who registered or updated the record.
                </li>
              </ul>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Content and interactions
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Announcements, posts, comments, likes, event or group
                  information, and related authorship and timestamps.
                </li>
                <li>
                  Photographs, videos, documents, filenames, file types, and
                  other content that you choose or are authorised to upload.
                </li>
              </ul>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Notifications, device, and technical information
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Notification title, text, type, recipient, related item,
                  read status, expiry, and timestamps.
                </li>
                <li>
                  Expo push token, limited device name or model information,
                  notification permission or preference status, session
                  identifiers, security records, service logs, and
                  information needed to diagnose faults.
                </li>
              </ul>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Enquiries, support, and complaints
              </h3>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Your contact details, organisation, message,
                  correspondence, complaint information, and relevant account
                  or service history.
                </li>
              </ul>
            </Section>

            <Section
              id="section-4"
              title="4. How do we obtain information?"
              icon="mingcute:download-2-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We obtain information directly from you when you register,
                edit a profile, join or manage activities, upload content,
                contact us, or use the service. We also receive information
                from:
              </p>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  A parent, guardian, family member, community administrator,
                  event organiser, ministry or group leader, volunteer, or
                  other authorised user.
                </li>
                <li>Apple, Google, or Microsoft when you choose social sign-in.</li>
                <li>
                  Your device, Expo, Apple Push Notification service,
                  Firebase Cloud Messaging, and our technical service
                  providers as needed to authenticate, secure, and operate
                  the service.
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                If we receive your information from someone else, the
                responsible controller will provide this notice or other
                suitable privacy information within the period required by
                law.
              </p>
            </Section>

            <Section
              id="section-5"
              title="5. Why do we use information, and what is our lawful basis?"
              icon="mingcute:scales-line"
            >
              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Provide accounts and requested platform features
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We use account, contact, profile, session, and activity
                information to register and authenticate users, provide
                requested features, keep records in sync, and deliver
                essential communications. ToGather relies on performance of a
                contract where the processing is necessary to provide a
                service you request. Where an organisation arranges access
                for you, ToGather may instead rely on its legitimate interest
                in providing the secure service requested by that
                organisation.
              </p>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Administer the participating community
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                The participating organisation uses community information to
                manage families, groups, ministries, events, volunteers,
                registrations, attendance, announcements, and member
                communications. It must state its own lawful basis. Depending
                on the activity, this may include legitimate interests in
                organising and safeguarding its community, performance of a
                contract, a legal obligation, or another basis explained in
                its supplementary notice.
              </p>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Keep the service safe and reliable
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We use account, device, session, usage, and log information
                to manage access, prevent misuse, investigate faults or
                incidents, maintain backups, and improve reliability. We rely
                on legitimate interests in operating a secure and effective
                service and on legal obligations where a specific law
                requires processing.
              </p>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Send notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We use notification records, preferences, and push tokens to
                deliver operational information about features you use. The
                basis is contract or legitimate interests, as applicable. You
                can change in-app categories and your device notification
                permission. Disabling a notification does not erase the
                underlying event, assignment, or other record.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Promotional or fundraising messages are kept separate from
                operational notices. We use consent where the Privacy and
                Electronic Communications Regulations require it. You can
                withdraw that consent at any time without affecting earlier
                lawful processing.
              </p>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Handle enquiries, support, complaints, and legal matters
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We use contact, correspondence, and relevant service
                information to answer enquiries, deliver support, investigate
                complaints, protect legal rights, and comply with law. We
                rely on steps requested before a contract, legitimate
                interests in resolving matters and maintaining accurate
                records, and legal obligation where applicable.
              </p>

              <h3 className="text-accent dark:text-gray-100 mb-2 mt-6 text-xl font-semibold">
                Website enquiries and demo requests
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                ToGather uses the name, email, phone number, organisation,
                and message submitted through www.togather.org.uk to respond
                and arrange a requested demonstration. The basis is taking
                steps at your request before a possible contract and
                ToGather&rsquo;s legitimate interest in responding to genuine
                enquiries.
              </p>
            </Section>

            <Section
              id="section-6"
              title="6. Special-category and safeguarding information"
              icon="mingcute:shield-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Ethnicity and information revealing religious beliefs are
                special-category data. Health, accessibility, safeguarding,
                or other sensitive information may also appear in content
                that an authorised person supplies. The responsible
                controller needs both an Article 6 lawful basis and an
                Article 9 condition before using such information.
              </p>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Optional ethnicity controlled by ToGather is used only for
                  a clearly explained purpose and with explicit consent. It
                  is optional, and consent can be withdrawn at any time.
                </li>
                <li>
                  A qualifying religious not-for-profit organisation may rely
                  on Article 9(2)(d) UK GDPR for information about members,
                  former members, or regular contacts, with appropriate
                  safeguards and no disclosure outside the body without
                  consent. That condition does not automatically apply to
                  ToGather.
                </li>
                <li>
                  For safeguarding or substantial-public-interest processing,
                  the responsible organisation must identify an applicable
                  legal condition and keep an Appropriate Policy Document
                  where the Data Protection Act 2018 requires one.
                </li>
              </ul>
              <Callout>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Do not put health, safeguarding, criminal-allegation, or
                  other highly sensitive information into an ordinary post,
                  notification, or upload unless the organisation has
                  provided an approved secure process.
                </p>
              </Callout>
            </Section>

            <Section
              id="section-7"
              title="7. What information is required, and what choices do you have?"
              icon="mingcute:list-check-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Name, email address, UK mobile number, and authentication
                information are required to create and use a standard
                account. Without them, we cannot create or secure the
                account or provide personalised app access.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Profile photograph, date of birth, gender, and ethnicity are
                optional unless the responsible organisation gives you a
                separate, lawful explanation for a specific feature. You can
                change optional profile information. Contact us if you
                cannot clear a value yourself.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Camera access is optional and used locally when you choose to
                scan an event QR code; scanning alone does not upload or
                retain a camera image. Photo-library and document access
                occurs when you choose a file for an upload. Notification
                permission is optional and can be changed in device
                settings.
              </p>
            </Section>

            <Section
              id="section-8"
              title="8. Who can see information?"
              icon="mingcute:eye-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Visibility depends on the feature, audience setting, and
                role. Profile details, authorship, comments, likes, group or
                ministry membership, volunteering, registration, and
                attendance may be visible to signed-in community members or
                to authorised administrators, leaders, event managers, and
                volunteers who need the information for their role.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                A &ldquo;public&rdquo; announcement in the app normally means
                visible across the signed-in community, not necessarily
                published on the open web. Group content is intended for the
                relevant audience, but you should not assume that a label by
                itself guarantees confidentiality.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Authorised administrators can export attendance information
                to an XLSX file and share it through another app. Once
                downloaded or shared, that copy is controlled by the
                participating organisation and recipient, who must protect
                it and apply appropriate retention.
              </p>
            </Section>

            <Section
              id="section-9"
              title="9. Who do we share information with?"
              icon="mingcute:share-2-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We disclose information only where needed for the purposes
                described above, where you direct us, or where law permits
                or requires it. Recipients may include:
              </p>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  The participating organisation and its authorised
                  administrators, leaders, staff, event managers,
                  coordinators, or volunteers.
                </li>
                <li>
                  Supabase, Inc., which provides authentication, database,
                  storage, server-function, and related backend services.
                </li>
                <li>
                  650 Industries, Inc. (Expo), which provides mobile
                  infrastructure and push-token delivery services.
                </li>
                <li>
                  Apple and Google for device push delivery, and Apple,
                  Google, or Microsoft when you choose their sign-in service.
                </li>
                <li>
                  Website, email, support, security, and infrastructure
                  providers acting under contract, including providers used
                  to route website enquiries.
                </li>
                <li>
                  An app or person that you choose when you download,
                  export, or share content.
                </li>
                <li>
                  Professional advisers, insurers, regulators, courts,
                  law-enforcement bodies, safeguarding authorities, or
                  another recipient where disclosure is necessary and
                  lawful.
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Processors may use approved subprocessors. We require
                processors to protect personal information, use it only on
                documented instructions, and notify us of relevant security
                incidents.
              </p>
            </Section>

            <Section
              id="section-10"
              title="10. International transfers"
              icon="mingcute:earth-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Some providers and their subprocessors may process
                information in the United States or other countries outside
                the United Kingdom. Remote access by authorised support
                personnel outside the UK can also be a restricted transfer.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Where UK law treats a disclosure as a restricted transfer,
                the responsible controller uses an applicable UK adequacy
                regulation, the UK International Data Transfer Agreement,
                the UK Addendum to the EU Standard Contractual Clauses, or
                another lawful safeguard. Where required, it also completes
                a transfer risk assessment and applies supplementary
                protections.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Supabase&rsquo;s data processing terms include UK transfer
                provisions; the project&rsquo;s selected hosting region and
                current subprocessors apply. Expo states that it
                participates in the UK Extension to the EU&ndash;US Data
                Privacy Framework and may also use contractual safeguards
                where appropriate. Push tokens and notification payloads
                pass through Expo to Apple or Google for delivery.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Contact info@togather.org.uk for the current transfer
                schedule or a copy of the relevant safeguards. Commercial
                terms and information about other people may be redacted
                where permitted.
              </p>
            </Section>

            <Section
              id="section-11"
              title="11. How long do we keep information?"
              icon="mingcute:time-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We keep personal information for as long as it is needed for
                the purposes described in this notice, and for as long as
                the participating organisation requires it for its
                community, safeguarding, financial, insurance, legal, and
                accountability duties. Because the app supports the ongoing
                life and records of the community, some information is
                retained on a long-term basis rather than deleted on a fixed
                short timetable.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                ToGather retains the information it controls (accounts,
                authentication, technical, and support records) as follows:
              </p>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Account, profile, and authentication records are kept
                  while the account is active. When an account is closed, or
                  when you ask us to delete your information, we delete or
                  irreversibly anonymise the records we control from live
                  systems, unless the participating organisation or the law
                  requires a specific record to be retained.
                </li>
                <li>
                  Push tokens are deactivated on sign-out or account closure
                  and removed once inactive or invalid.
                </li>
                <li>
                  Notification-feed items are kept until they expire, you
                  clear them, or they are no longer needed.
                </li>
                <li>
                  Website enquiries and demo requests are kept for up to 12
                  months after the last meaningful contact, unless they
                  become part of an active customer or contract record.
                </li>
                <li>
                  Security and operational logs are normally kept for around
                  12 months. Support, complaint, and legal-claim records may
                  be kept for up to six years.
                </li>
                <li>
                  Once information is deleted from live systems, residual
                  copies in backups become inaccessible through the normal
                  backup cycle.
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Community records held by the participating organisation
                &mdash; including posts, event and attendance records,
                family, ministry, volunteering, and safeguarding information
                &mdash; are retained by that organisation for as long as it
                needs them for its own purposes, which may be long-term or
                indefinite where safeguarding, insurance, charity, or legal
                duties require it. The participating organisation sets and
                can provide its own retention periods for these records.
                Downloaded exports follow that organisation&rsquo;s
                schedule.
              </p>
            </Section>

            <Section
              id="section-12"
              title="12. Account deletion and information outside our control"
              icon="mingcute:delete-2-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Selecting Delete Account sends a deletion request to the
                service, deactivates push notifications for that device, and
                signs you out. We delete or anonymise account and profile
                information covered by that process, except for records
                that the responsible controller must retain for a stated
                legal, safeguarding, security, or dispute purpose.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Attendance or other historical activity may be retained
                without a link to your account under the participating
                organisation&rsquo;s schedule. Files already downloaded,
                shared, or cached by another person or app may remain
                outside our control. Contact info@togather.org.uk if you
                want confirmation of what information remains after account
                closure.
              </p>
            </Section>

            <Section
              id="section-13"
              title="13. How do we protect information?"
              icon="mingcute:safe-lock-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We use technical and organisational measures designed to
                protect information, including authenticated access,
                role-based permissions, contractual controls for processors,
                encrypted network connections, monitoring, backups, and
                staff access controls appropriate to risk. No online service
                can guarantee absolute security.
              </p>
              <Callout>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  You should protect your login credentials, keep your
                  device and app up to date, review who can see content
                  before posting, and tell us promptly if you suspect
                  unauthorised access. Do not include sensitive details in
                  filenames or notification text.
                </p>
              </Callout>
            </Section>

            <Section
              id="section-14"
              title="14. Children's information"
              icon="mingcute:user-3-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                The app may hold children&rsquo;s names, family
                relationships, registrations, and attendance where a parent,
                guardian, or authorised participating organisation supplies
                them. Children&rsquo;s information receives additional
                protection and is not used for behavioural advertising.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                A person adding a child&rsquo;s information must have
                authority to do so. The participating organisation must
                identify an appropriate lawful basis, minimise access, use
                high-privacy defaults, and explain any safeguarding use.
                Children have their own data-protection rights, even where
                an adult originally supplied their information.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                If an online service is offered directly to a child and
                consent is the lawful basis, a child aged 13 or over may
                generally consent under UK law; for a child under 13,
                verified parental authorisation is required. Another lawful
                basis may apply instead. We provide age-appropriate
                information and assistance where a child uses the service.
              </p>
            </Section>

            <Section
              id="section-15"
              title="15. Automated decision-making, advertising, and sale"
              icon="mingcute:robot-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                The current service does not make solely automated decisions
                about you that produce legal or similarly significant
                effects. The current app does not include a third-party
                advertising or behavioural-analytics SDK. We do not sell
                personal information. If any of these practices change, we
                will update this notice before the new use begins and
                provide any choices required by law.
              </p>
            </Section>

            <Section
              id="section-16"
              title="16. Your data-protection rights"
              icon="mingcute:contract-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Depending on the information, purpose, and lawful basis, you
                may have the right to:
              </p>
              <ul className="text-gray-600 dark:text-gray-300 mb-4 list-inside list-disc text-lg">
                <li>
                  Ask for access to your personal information and
                  information about how it is used.
                </li>
                <li>
                  Have inaccurate information corrected and incomplete
                  information completed.
                </li>
                <li>Ask for information to be erased.</li>
                <li>Ask us to restrict how information is used.</li>
                <li>
                  Object to processing based on legitimate interests or to
                  direct marketing.
                </li>
                <li>
                  Receive information you supplied in a portable format
                  where the right applies.
                </li>
                <li>
                  Withdraw consent at any time. Withdrawal does not affect
                  processing that was lawful before withdrawal.
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Rights are not absolute, and an exemption may apply. To make
                a request, email info@togather.org.uk or contact the
                participating organisation responsible for the community
                record. We may ask for information needed to verify your
                identity. We normally respond without undue delay and within
                one month; the law permits an extension for a complex
                request, and we will explain if that applies.
              </p>
            </Section>

            <Section
              id="section-17"
              title="17. Complaints"
              icon="mingcute:notification-line"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Please contact us first so that we can investigate and try to
                resolve your concern. You can email info@togather.org.uk or
                write to TO-GATHER C.I.C., 167&ndash;169 Great Portland
                Street, London W1W 5PF, United Kingdom.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                We will facilitate your data-protection complaint,
                acknowledge it within 30 days, investigate and respond
                without undue delay, tell you the outcome, and keep you
                informed where appropriate.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                You may also complain to the Information Commissioner&rsquo;s
                Office (ICO), the UK data-protection regulator:
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Information Commissioner&rsquo;s Office
                <br />
                Wycliffe House, Water Lane
                <br />
                Wilmslow, Cheshire SK9 5AF
                <br />
                Telephone: 0303 123 1113
                <br />
                Website: https://ico.org.uk/make-a-complaint/
              </p>
            </Section>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default PrivacyPolicyV2;
