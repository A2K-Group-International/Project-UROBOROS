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
  poll: {
    label: "Poll Management",
    link: "/poll",
    icon: "mingcute:chart-horizontal-fill",
    selectedIcon: "mingcute:chart-horizontal-fill",
  },
  poll_list: {
    label: "Poll List",
    link: "/poll-list",
    icon: "mingcute:chart-horizontal-fill",
    selectedIcon: "mingcute:chart-horizontal-fill",
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
    COMMON_LINKS.poll,
  ],
  volunteer: [
    COMMON_LINKS.announcements,
    COMMON_LINKS.schedule,
    COMMON_LINKS.ministries,
    COMMON_LINKS.poll_list,
  ],
  parishioner: [
    COMMON_LINKS.announcements,
    COMMON_LINKS.events,
    COMMON_LINKS.family,
    COMMON_LINKS.ministries,
    COMMON_LINKS.poll_list,
  ],
  coparent: [
    COMMON_LINKS.announcements,
    COMMON_LINKS.events,
    COMMON_LINKS.family,
    COMMON_LINKS.ministries,
    COMMON_LINKS.poll_list,
  ],
  admin: [
    COMMON_LINKS.dashboard,
    COMMON_LINKS.announcements,
    COMMON_LINKS.ministries,
    COMMON_LINKS.schedule,
    COMMON_LINKS.poll,
    COMMON_LINKS.requests,
  ],
});
