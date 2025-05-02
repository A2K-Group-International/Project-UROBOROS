import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { Icon } from "@iconify/react";
import { Label } from "./ui/label";
import { useNotifications } from "@/hooks/useNotification";
import { Loader2 } from "lucide-react";

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useNotifications();

  const unreadNotificationCount = notifications.filter(
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
      <NotificationContent
        isOpen={isOpen}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        notificationsError={notificationsError}
      />
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
      <span className="flex h-full w-12 items-center justify-center rounded-full bg-red text-white">
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

const NotificationContent = ({
  isOpen,
  notifications,
  notificationsLoading,
  notificationsError,
}) => {
  const notificationIcons = {
    announcement_created: "mdi:comment-outline",
    reply: "mdi:comment-outline",
    event: "mingcute:calendar-line",
    like: "mingcute:thumb-up-2-fill",
    reminder: "carbon:reminder",
  };

  if (notificationsError) {
    return (
      <div
        className={`absolute bottom-0 left-[14rem] z-50 h-[36rem] w-[35rem] rounded-2xl bg-white drop-shadow-xl transition-all duration-150 ${isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
      >
        <div className="text-red-500 flex h-full items-center justify-center">
          <p>Error loading notifications: {notificationsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute bottom-0 left-[14rem] z-50 h-[36rem] w-[35rem] rounded-2xl bg-white drop-shadow-xl transition-all duration-150 ${isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
    >
      {/* Header */}
      <div className="border-b border-b-primary">
        <div className="p-6">
          <Label className="text-lg font-bold">Notifications</Label>
        </div>
      </div>
      {/* Notification item */}
      <div className="no-scrollbar h-[31rem] overflow-y-scroll px-8">
        {notificationsLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex w-full cursor-pointer gap-x-2 border-b border-b-primary/40 py-4 ${notification.read ? "opacity-50" : "opacity-100"}`}
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
                <Label className="text-sm font-bold">
                  {notification.title}
                </Label>
                <p className="font-medium">{notification.body}</p>
                <p className="text-xs font-semibold text-primary-blue-light">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(notification.created_at))}
                  ;{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }).format(new Date(notification.created_at))}
                </p>
              </div>
              {/* Dot */}
              <div className="w-20">
                {!notification.read && (
                  <Icon icon="mdi:dot" width={52} color="#FF0051" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

NotificationContent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
    })
  ).isRequired,
  notificationsLoading: PropTypes.bool.isRequired,
  notificationsError: PropTypes.object,
};

export default Notification;
