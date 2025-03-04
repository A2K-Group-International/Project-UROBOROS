const COMMON_LINKS = {
  announcements: {
    label: "Announcements",
    link: "/announcements",
    icon: "mingcute:announcement-line",
    selectedIcon: "mingcute:announcement-fill",
  },
  schedule: {
    label: "Schedule",
    link: "/schedule",
    icon: "mingcute:calendar-time-add-line",
    selectedIcon: "mingcute:calendar-time-add-fill",
  },
  events: {
    label: "Events",
    link: "/events",
    icon: "mingcute:calendar-time-add-line",
    selectedIcon: "mingcute:calendar-time-add-fill",
  },
  family: {
    label: "Family",
    link: "/family",
    icon: "mingcute:group-3-line",
    selectedIcon: "mingcute:group-3-fill",
  },
  ministries: {
    label: "Ministries",
    link: "/ministries",
    icon: "mingcute:group-3-line",
    selectedIcon: "mingcute:group-3-fill",
  },
  dashboard: {
    label: "Dashboard",
    link: "/dashboard",
    icon: "mingcute:classify-2-line",
    selectedIcon: "mingcute:classify-2-fill",
  },
  requests: {
    label: "Requests",
    link: "/requests",
    icon: "mingcute:inventory-line",
    selectedIcon: "mingcute:inventory-fill",
  },
};

export const SIDEBAR_LINKS = Object.freeze({
  coordinator: [
    COMMON_LINKS.dashboard,
    COMMON_LINKS.announcements,
    COMMON_LINKS.ministries,
    COMMON_LINKS.schedule,
  ],
  volunteer: [
    COMMON_LINKS.announcements,
    COMMON_LINKS.schedule,
    COMMON_LINKS.ministries,
  ],
  parishioner: [
    COMMON_LINKS.announcements,
    COMMON_LINKS.events,
    COMMON_LINKS.family,
    COMMON_LINKS.ministries,
  ],
  coparent: [
    COMMON_LINKS.announcements,
    COMMON_LINKS.events,
    COMMON_LINKS.family,
    COMMON_LINKS.ministries,
  ],
  admin: [
    COMMON_LINKS.dashboard,
    COMMON_LINKS.announcements,
    COMMON_LINKS.ministries,
    COMMON_LINKS.schedule,
    COMMON_LINKS.requests,
  ],
});
