import { it, describe, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Notification from "../Notification";

// At the top of your file, before your mocks
let mockNotificationsData = [];

// useUser mock to return userData
vi.mock("@/context/useUser", () => ({
  useUser: () => ({ userData: { id: "test-user-123" } }),
}));

// Update your mock to use the variable
vi.mock("@/hooks/useNotification", () => ({
  useUnreadNotificationCount: () => ({ data: 5, isLoading: false }),
  useNotifications: () => ({
    data: mockNotificationsData, // Reference the variable here
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useMarkNotificationAsRead: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteNotification: () => ({ mutate: vi.fn(), isPending: false }),
  useClearAllNotifications: () => ({ mutate: vi.fn() }),
  useMarkAllAsRead: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/hooks/useRoleSwitcher", () => ({
  default: () => ({ onSwitchRole: vi.fn() }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/" }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

// Mock React hooks
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useState: vi.fn().mockImplementation(actual.useState),
    useEffect: vi.fn().mockImplementation(actual.useEffect),
    useRef: vi.fn().mockImplementation(actual.useRef),
  };
});

describe("Notification Component", () => {
  it("should render the Notification component without crashing", () => {
    render(<Notification isMobile={true} />);

    // Simple assertion to check if rendering worked
    expect(true).toBe(true);
  });

  it("should render the Notifications text", () => {
    render(<Notification isMobile={false} />);

    // Use getAllByText instead of getByText since there are multiple "Notifications" elements
    const notificationElements = screen.getAllByText("Notifications");

    // Check if at least one element exists
    expect(notificationElements.length).toBeGreaterThan(0);
  });

  // Update your test to be more specific
  it("should render the Notifications text in the button", () => {
    render(<Notification isMobile={false} />);

    // Be more specific by using a test-id or more specific selector
    const buttonText = screen.getAllByText("Notifications")[0]; // Get the first occurrence
    expect(buttonText).toBeInTheDocument();

    // Alternative: check if at least one element with this text exists
    expect(screen.getAllByText("Notifications").length).toBeGreaterThan(0);
  });

  // Or better yet, be more specific with your selector
  it("should render notification button with badge count", () => {
    render(<Notification isMobile={false} />);

    // Find the outer container that holds both the text and badge
    const notificationButton = screen
      .getAllByText("Notifications")[0]
      .closest("div.flex.h-10"); // Get the outer container with both classes

    // Now check if the badge with count is there
    const badge = screen.getByText("5");
    expect(badge).toBeInTheDocument();

    // Check the badge is inside the same parent container as the button text
    expect(notificationButton).toContainElement(badge);
  });

  // Then add your notification data test
  it("should render notification data", () => {
    // Set mock data for this specific test
    mockNotificationsData = [
      {
        id: "1",
        title: "New Announcement",
        body: "There is a new upcoming event",
        created_at: "2025-05-10T10:00:00Z",
        entity_id: "/announcements?announcementId=announcement-123",
        type: "announcement_created",
        receiver_id: "test-user-123",
      },
    ];

    render(<Notification isMobile={false} />);

    // Check for notification content
    expect(screen.getByText("New Announcement")).toBeInTheDocument();
    expect(
      screen.getByText("There is a new upcoming event")
    ).toBeInTheDocument();

    // Verify "No notifications" message is not shown
    expect(screen.queryByText("No notifications")).not.toBeInTheDocument();
  });
});

// Add this to reset the data after each test
afterEach(() => {
  mockNotificationsData = [];
});
