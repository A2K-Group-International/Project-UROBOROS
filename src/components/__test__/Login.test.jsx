import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Login from "../Login";

// Mock dependencies
const mockNavigate = vi.fn();
let mockLocationState = { from: "/announcements" };
const mockLogin = vi.fn();
const mockToast = vi.fn();
let mockLoading = false;

// Mock modules
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: mockLocationState }),
}));

vi.mock("@/context/useUser", () => ({
  useUser: () => ({
    login: mockLogin,
    loading: mockLoading,
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock child component
vi.mock("../ForgotPassword", () => ({
  default: () => (
    <div data-testid="forgot-password">Forgot Password Component</div>
  ),
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLoading = false;
    mockLocationState = { from: "/announcements" };
  });

  it("renders the login button initially", async () => {
    render(<Login />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it("opens dialog when login button is clicked", async () => {
    render(<Login />);
    const user = userEvent.setup();

    // Click the login button to open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verify the dialog content is displayed
    expect(
      screen.getByText(
        "Enter your account information to access your dashboard."
      )
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  it("toggles password visibility when checkbox is clicked", async () => {
    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Get password field
    const passwordField = screen.getByPlaceholderText("Enter your password");

    // Initially password is hidden
    expect(passwordField).toHaveAttribute("type", "password");

    // Click show password checkbox
    await user.click(screen.getByRole("checkbox"));

    // Password should now be visible
    expect(passwordField).toHaveAttribute("type", "text");

    // Click again to hide
    await user.click(screen.getByRole("checkbox"));

    // Password should be hidden again
    expect(passwordField).toHaveAttribute("type", "password");
  });

  it("shows validation errors when submitting empty form", async () => {
    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Submit form without filling fields
    const submitButton = screen.getByRole("button", {
      name: /^login$/i,
    });
    await user.click(submitButton);

    // Check validation messages - look directly for the validation text messages
    await waitFor(() => {
      expect(screen.getByText(/email must be valid/i)).toBeInTheDocument();
      expect(
        screen.getByText(/password must be 6 characters/i)
      ).toBeInTheDocument();
    });

    // Verify login wasn't called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("successfully logs in with valid credentials", async () => {
    // Setup mocks for success case
    mockLogin.mockResolvedValueOnce({ user: { email: "test@example.com" } });

    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Fill in form fields
    await user.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password123!"
    );

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /^login$/i,
    });
    await user.click(submitButton);

    // Verify login was called with correct data
    expect(mockLogin).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password123!",
    });

    // Check navigation and toast
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/announcements", {
        replace: true,
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: "Login Successfully",
      });
    });
  });

  it("shows error toast when login fails", async () => {
    // Setup mocks for error case
    const errorMessage = "Invalid email or password";
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Fill in form fields
    await user.type(
      screen.getByPlaceholderText("Enter your email"),
      "wrong@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "WrongPassword"
    );

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /^login$/i,
    });
    await user.click(submitButton);

    // Verify error handling
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: errorMessage,
        variant: "destructive",
      });
    });

    // Verify navigation wasn't called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows loading state during login attempt", async () => {
    // Setup loading state
    mockLoading = true;

    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Fill in form fields
    await user.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password123!"
    );

    // Verify loading state on button
    const submitButton = screen.getByRole("button", {
      name: /logging in/i,
    });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Logging in...");
  });

  it("resets form when dialog is closed with Cancel button", async () => {
    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Fill form partially
    await user.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@example.com"
    );

    // Close dialog with Cancel button
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Open dialog again
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Verify form was reset
    expect(screen.getByPlaceholderText("Enter your email")).toHaveValue("");
  });

  it("handles custom redirection from location state", async () => {
    // Set up custom location state before rendering
    mockLocationState = { from: "/custom-page" };

    // Setup our mock to resolve successfully
    mockLogin.mockResolvedValueOnce({ user: { email: "test@example.com" } });

    // Render component
    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Fill form
    await user.type(
      screen.getByPlaceholderText("Enter your email"),
      "test@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "Password123!"
    );

    // Submit form
    const submitButton = screen.getByRole("button", {
      name: /^login$/i,
    });
    await user.click(submitButton);

    // Verify navigation to custom path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/custom-page", {
        replace: true,
      });
    });
  });

  it("renders the ForgotPassword component", async () => {
    render(<Login />);
    const user = userEvent.setup();

    // Open dialog
    await user.click(screen.getByRole("button", { name: /login/i }));

    // Check ForgotPassword is rendered
    expect(screen.getByTestId("forgot-password")).toBeInTheDocument();
  });
});
