import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { Icon } from "@iconify/react";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";

import {
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/useNotification";
import { Button } from "./ui/button";

const Notification = ({ isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useNotifications({ enabled: isOpen });

  const { data: unreadCount = 0, isLoading: countLoading } =
    useUnreadNotificationCount();

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
    <div
      className={`${isMobile ? "w-auto" : "relative w-full"}`}
      ref={notificationRef}
    >
      <NotificationButton
        btnName="Notifications"
        toggleNotification={handleToggle}
        count={unreadCount || 0}
        countLoading={countLoading}
        isMobile={isMobile}
      />
      <NotificationContent
        isOpen={isOpen}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        notificationsError={notificationsError}
        isMobile={isMobile}
      />
    </div>
  );
};

Notification.propTypes = {
  isMobile: PropTypes.bool.isRequired,
};

const NotificationButton = ({
  btnName,
  toggleNotification,
  count,
  countLoading,
  isMobile,
}) => {
  if (isMobile) {
    return (
      <div className="mt-2 h-full lg:hidden">
        <div className="flex h-full flex-col items-center justify-end">
          <Button
            variant="ghost"
            className="block h-auto p-0"
            onClick={toggleNotification}
          >
            <Icon
              icon="mingcute:notification-line"
              className="text-primary-text"
              fontSize={22}
            />
          </Button>
          <p className="mt-2 text-center text-[8px] font-bold text-accent">
            Notifications
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex h-10 cursor-pointer select-none items-center justify-between rounded-full bg-white py-1 pl-3 pr-1 text-[16px] font-medium text-accent"
      onClick={toggleNotification}
    >
      <div className="flex w-full items-center gap-x-2">
        <Icon icon="mingcute:notification-line" className="h-6 w-6" />
        <span>{btnName}</span>
      </div>
      <span className="flex h-full w-12 items-center justify-center rounded-full bg-danger text-white">
        {countLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : count}
      </span>
    </div>
  );
};

NotificationButton.propTypes = {
  btnName: PropTypes.string.isRequired,
  toggleNotification: PropTypes.func.isRequired,
  count: PropTypes.number.isRequired,
  countLoading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export const NotificationContent = ({
  isOpen,
  notifications,
  notificationsLoading,
  notificationsError,
  isMobile,
}) => {
  const notificationIcons = {
    announcement_created: "mingcute:announcement-line",
    comment: "mdi:comment-outline",
    event_created: "mingcute:calendar-line",
    like: "mingcute:thumb-up-2-fill",
    reminder: "carbon:reminder",
  };

  const limitString = (str, maxLength) => {
    if (str.length <= maxLength) {
      return str;
    } else {
      return `${str.slice(0, maxLength)}...`;
    }
  };

  if (notificationsError && isMobile) {
    return (
      <div
        className={`no-scrollbar absolute left-1/2 top-1/2 z-50 w-[calc(100%-1rem)] max-w-[35rem] -translate-y-[58%] transform overflow-y-scroll rounded-2xl border border-accent/20 bg-white transition-all duration-150 ${isOpen ? "-translate-x-1/2 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
      >
        <div className="flex h-full items-center justify-center text-red-500">
          <p>Error loading notifications: {notificationsError.message}</p>
        </div>
      </div>
    );
  }

  if (notificationsError) {
    return (
      <div
        className={`absolute bottom-0 left-[14rem] z-50 h-[36rem] w-[35rem] rounded-2xl bg-white drop-shadow-xl transition-all duration-150 ${isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
      >
        <div className="flex h-full items-center justify-center text-red-500">
          <p>Error loading notifications: {notificationsError.message}</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div
        className={`no-scrollbar absolute left-1/2 top-1/2 z-50 h-full max-h-[35rem] w-[calc(100%-1rem)] max-w-[35rem] -translate-y-[58%] transform overflow-y-scroll rounded-2xl border border-accent/20 bg-white transition-all duration-150 ${isOpen ? "-translate-x-1/2 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
      >
        {/* Header */}
        <div className="border-b border-b-primary">
          <div className="p-4">
            <Label className="text-md font-bold">Notifications</Label>
          </div>
        </div>
        {/* Notification item */}
        <div className="no-scrollbar h-[31rem] overflow-y-scroll px-4">
          {notificationsLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Label className="text-primary-text">No notifications yet</Label>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex w-full cursor-pointer gap-x-2 border-b border-b-primary/40 py-4 ${notification.read ? "opacity-50" : "opacity-100"}`}
              >
                {/* Icon */}
                <div className="flex h-11 w-16 items-center justify-center rounded-full bg-primary-text">
                  <Icon
                    icon={
                      notificationIcons[notification.type] || "mdi:bell-outline"
                    }
                    width={20}
                    color="white"
                  />
                </div>
                {/* Description */}
                <div className="flex w-full flex-col gap-y-1 text-primary-text">
                  <Label className="text-xs">
                    {{
                      announcement_created: "Announcement",
                      event_created: "Upcoming event",
                      comment: "Comment",
                    }[notification.type] || ""}
                  </Label>
                  <Label className="text-sm font-bold">
                    {notification.title || ""}
                  </Label>
                  <p className="font-medium">
                    {limitString(notification?.body || "", 70)}
                  </p>
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
  }

  return (
    <div
      className={`absolute z-50 h-[36rem] w-[35rem] rounded-2xl bg-white drop-shadow-xl transition-all duration-150 lg:bottom-0 lg:left-[14rem] ${isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
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
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Label className="text-primary-text">No notifications yet</Label>
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
                <Label className="text-xs">
                  {{
                    announcement_created: "Announcement",
                    event_created: "Upcoming event",
                    comment: "Comment",
                  }[notification.type] || ""}
                </Label>
                <Label className="text-sm font-bold">
                  {notification.title || ""}
                </Label>
                <p className="font-medium">
                  {limitString(notification?.body || "", 70)}
                </p>
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
      title: PropTypes.string,
      body: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      read: PropTypes.bool.isRequired,
    })
  ).isRequired,
  notificationsLoading: PropTypes.bool.isRequired,
  notificationsError: PropTypes.object,
  isMobile: PropTypes.bool.isRequired,
};

export default Notification;
