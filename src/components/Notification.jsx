import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import { Icon } from "@iconify/react";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";

import {
  useUnreadNotificationCount,
  useNotifications,
} from "@/hooks/useNotification";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/useUser";

const Notification = ({ isMobile = false }) => {
  const { userData } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingReadNotifications, setViewingReadNotifications] =
    useState(false);
  const notificationRef = useRef(null);

  const {
    data: notifications = [],
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useNotifications({
    enabled: isOpen,
    userId: userData?.id,
    isRead: viewingReadNotifications,
  });

  const { data: unreadCount = 0, isLoading: countLoading } =
    useUnreadNotificationCount();

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setViewingReadNotifications(false);
    }
  };

  const toggleNotificationView = () => {
    setViewingReadNotifications((prev) => !prev);
    refetchNotifications();
  };

  // Close the notification when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const alertDialog = document.querySelector("[role='alertdialog']");
      const menuContent = document.querySelector("[role='menu']");

      if (
        alertDialog?.contains(event.target) ||
        menuContent?.contains(event.target)
      ) {
        return; // Click was inside alert dialog or menu, don't close notification
      }

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
        setIsOpen={setIsOpen}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        notificationsError={notificationsError}
        isMobile={isMobile}
        viewingReadNotifications={viewingReadNotifications}
        toggleNotificationView={toggleNotificationView}
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

const NotificationContent = ({
  isOpen,
  notifications,
  notificationsLoading,
  notificationsError,
  setIsOpen,
  isMobile,
  viewingReadNotifications,
  toggleNotificationView,
}) => {
  const navigate = useNavigate();

  const handleClick = (notificationType, entity_id) => {
    switch (notificationType) {
      case "announcement_created":
        navigate(`/announcements?announcementId=${entity_id}`);
        break;
      case "event_created":
      case "event_assigned":
      case "event_volunteer_replaced":
      case "event_volunteer_removed":
        navigate(`/schedule?event=${entity_id}`);
        break;
      case "comment":
        navigate("/announcements");
        break;
      default:
        break;
    }
    setIsOpen(false);
  };
  const notificationIcons = {
    announcement_created: "mingcute:announcement-line",
    comment: "mdi:comment-outline",
    event_created: "mingcute:calendar-line",
    event_assigned: "mingcute:task-2-line",
    event_volunteer_replaced: "mingcute:transfer-3-line",
    event_volunteer_removed: "mingcute:forbid-circle-line",
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
        className={`absolute left-1/2 top-0 z-50 h-[calc(100%-6rem)] w-[calc(100%-1rem)] max-w-[35rem] -translate-x-1/2 transform rounded-2xl border border-accent/20 bg-white transition-all duration-150 ${isOpen ? "opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          {viewingReadNotifications ? (
            <Button
              variant="link"
              onClick={toggleNotificationView}
              className="text-primary-text"
            >
              <Icon icon="mingcute:arrow-left-line" />
              Back
            </Button>
          ) : (
            <Label className="text-md font-bold">Notifications</Label>
          )}
          <MarkAllAsRead />
        </div>
        {/* Notification item */}
        <div className="no-scrollbar h-[calc(100%-8rem)] overflow-y-scroll border-y border-y-primary px-4">
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
                onClick={() =>
                  handleClick(notification.type, notification.entity_id)
                }
                key={notification.id}
                className={
                  "flex w-full cursor-pointer gap-x-2 border-b border-b-primary/40 py-4"
                }
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
                      event_assigned: "Assigned event",
                      comment: "Comment",
                    }[notification.type] || ""}
                  </Label>
                  <Label className="text-xs font-bold">
                    {notification.title || ""}
                  </Label>
                  <p className="text-xs font-medium">
                    {limitString(notification?.body || "", 100)}
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
                {/* Action */}
                <div className="w-20 self-center">
                  <NotificationActionMenu
                    viewingReadNotifications={viewingReadNotifications}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        {/* Notification Footer */}
        {!viewingReadNotifications && (
          <div className="p-4 text-center">
            <Button
              variant="link"
              className="text-md decoration-inherit/50 h-auto p-0 text-primary-text hover:underline"
              onClick={toggleNotificationView}
            >
              See past notifications
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div
      className={`absolute z-50 w-[35rem] rounded-2xl bg-white drop-shadow-xl transition-all duration-150 lg:bottom-0 lg:left-[14rem] ${isOpen ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-5 opacity-0"}`}
    >
      {/* Header */}
      <div>
        {viewingReadNotifications ? (
          <div className="flex items-center justify-between p-6">
            <Button
              variant="link"
              onClick={toggleNotificationView}
              className="text-primary-text"
            >
              <Icon icon="mingcute:arrow-left-line" />
              Back
            </Button>
            <ClearReadNotifications />
          </div>
        ) : (
          <div className="flex items-center justify-between p-6">
            <Label className="text-md font-bold">Notifications</Label>
            <MarkAllAsRead />
          </div>
        )}
      </div>
      {/* Notification item */}
      <div className="no-scrollbar h-[31rem] overflow-y-scroll border-y border-y-primary px-8">
        {notificationsLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Label className="text-primary-text">
              {viewingReadNotifications
                ? "No past notifications"
                : "No notifications yet"}
            </Label>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              onClick={() =>
                handleClick(notification.type, notification.entity_id)
              }
              key={notification.id}
              className={
                "flex w-full cursor-pointer gap-x-2 border-b border-b-primary/40 py-4"
              }
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
                    event_assigned: "Assigned event",
                    comment: "Comment",
                  }[notification.type] || ""}
                </Label>
                <Label className="cursor-pointer text-sm font-bold">
                  {notification.title || ""}
                </Label>
                <p className="font-medium">
                  {limitString(notification?.body || "", 100)}
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
              {/* Action */}
              <div className="w-20 self-center">
                <NotificationActionMenu
                  viewingReadNotifications={viewingReadNotifications}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {/* Notification Footer */}
      {!viewingReadNotifications && (
        <div className="p-6 text-center">
          <Button
            variant="link"
            className="text-md decoration-inherit/50 h-auto p-0 text-primary-text hover:underline"
            onClick={toggleNotificationView}
          >
            See past notifications
          </Button>
        </div>
      )}
    </div>
  );
};

NotificationContent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string,
      body: PropTypes.string,
      created_at: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      is_read: PropTypes.bool.isRequired,
    })
  ).isRequired,
  notificationsLoading: PropTypes.bool.isRequired,
  notificationsError: PropTypes.object,
  isMobile: PropTypes.bool.isRequired,
  viewingReadNotifications: PropTypes.bool.isRequired,
  toggleNotificationView: PropTypes.func.isRequired,
};

const MarkAllAsRead = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-3xl border-accent/20 p-2 text-xs font-semibold text-primary-text hover:bg-primary-text hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          Mark all as read
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={(e) => e.stopPropagation()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const ClearReadNotifications = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-3xl border-accent/20 p-2 text-xs font-semibold text-primary-text hover:bg-primary-text hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          Clear All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={(e) => e.stopPropagation()}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const NotificationActionMenu = ({ viewingReadNotifications }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="transparent" onClick={(e) => e.stopPropagation()}>
          <Icon icon="tabler:dots-vertical" className="text-primary-text" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!viewingReadNotifications && (
          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
            Mark as read
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

NotificationActionMenu.propTypes = {
  viewingReadNotifications: PropTypes.bool.isRequired,
};

export default Notification;
