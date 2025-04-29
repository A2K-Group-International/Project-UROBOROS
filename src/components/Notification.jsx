import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { Icon } from "@iconify/react";
import { Label } from "./ui/label";

const notificationsData = [
  {
    id: 1,
    title: "New Comment",
    description: "John Doe commented on your post.",
    timestamp: "2025-04-29T10:30:00Z",
    type: "comment",
    read: false,
  },
  {
    id: 2,
    title: "Reply to Your Comment",
    description: "Jane Smith replied to your comment.",
    timestamp: "2025-04-29T09:15:00Z",
    type: "reply",
    read: false,
  },
  {
    id: 3,
    title: "Assigned Event",
    description: "You have been assigned to the 'Annual Meeting' event.",
    timestamp: "2025-04-28T15:45:00Z",
    type: "event",
    read: true,
  },
  {
    id: 4,
    title: "New Like",
    description: "Your comment received a like from Alex Johnson.",
    timestamp: "2025-04-28T12:20:00Z",
    type: "like",
    read: true,
  },
  {
    id: 5,
    title: "Event Reminder",
    description: "Reminder: 'Team Building Activity' starts tomorrow at 10 AM.",
    timestamp: "2025-04-27T09:15:00Z",
    type: "reminder",
    read: false,
  },
  {
    id: 6,
    title: "Upcoming Event",
    description: "Reminder: 'Team Building Activity' starts tomorrow at 10 AM.",
    timestamp: "2025-04-27T09:15:00Z",
    type: "reminder",
    read: false,
  },
];

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  const unreadNotificationCount = notificationsData.filter(
    (notification) => !notification.read
  ).length;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Close the notification when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative w-full" ref={notificationRef}>
      <NotificationButton
        btnName="Notifications"
        toggle={handleToggle}
        count={unreadNotificationCount}
      />
      <NotificationContent isOpen={isOpen} />
    </div>
  );
};

const NotificationButton = ({ btnName, toggle, count }) => {
  return (
    <div
      className="flex h-10 cursor-pointer select-none items-center justify-between rounded-full bg-white py-1 pl-3 pr-1 text-[16px] font-medium text-accent"
      onClick={toggle}
    >
      <div className="flex w-full items-center gap-x-2">
        <Icon icon="mingcute:notification-line" className="h-6 w-6" />
        <span>{btnName}</span>
      </div>
      <span className="bg-red flex h-full w-12 items-center justify-center rounded-full text-white">
        {count}
      </span>
    </div>
  );
};

NotificationButton.propTypes = {
  btnName: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
};

const NotificationContent = ({ isOpen }) => {
  const notificationIcons = {
    comment: "mdi:comment-outline",
    reply: "mdi:comment-outline",
    event: "mingcute:calendar-line",
    like: "mingcute:thumb-up-2-fill",
    reminder: "carbon:reminder",
  };

  return (
    <div
      className={`absolute bottom-0 left-[14rem] z-50 h-[36rem] w-[38rem] rounded-2xl bg-white drop-shadow-xl transition-all duration-150 ${isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
    >
      {/* Header */}
      <div className="border-b border-b-primary">
        <div className="p-6">
          <Label className="text-lg font-bold">Notifications</Label>
        </div>
      </div>
      {/* Parent div */}
      <div className="no-scrollbar h-[31rem] overflow-y-scroll px-8">
        {notificationsData.map((notification) => (
          <div
            key={notification.id}
            className={`flex w-full cursor-pointer gap-x-2 border-b border-primary/40 py-4 ${notification.read ? "opacity-50" : "opacity-100"}`}
          >
            {/* Icon */}
            <div className="flex h-12 w-16 items-center justify-center rounded-full bg-primary-text">
              <Icon
                icon={
                  notificationIcons[notification.type] || "mdi:bell-outline"
                }
                width={24}
                color="white"
              />
            </div>
            {/* Description */}
            <div className="flex w-full flex-col gap-y-1 text-primary-text">
              <Label className="text-sm font-bold">{notification.title}</Label>
              <p className="font-medium">{notification.description}</p>
              <p className="text-primary-blue-light text-xs font-semibold">
                {new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                }).format(new Date(notification.timestamp))}
                ;{" "}
                {new Intl.DateTimeFormat("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(notification.timestamp))}
              </p>
            </div>
            {/* Dot */}
            <div className="w-20">
              {!notification.read && (
                <Icon icon="mdi:dot" width={52} color="#FF0051" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

NotificationContent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
};

export default Notification;
