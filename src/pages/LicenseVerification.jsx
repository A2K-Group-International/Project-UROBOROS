import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const LicenseVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState({
    isLoading: true,
    isValid: false,
    isVerified: false,
    isExpired: false,
    message: "",
  });

  const [verifying, setVerifying] = useState(false);

  // Check token status on page load
  useEffect(() => {
    const checkTokenStatus = async () => {
      try {
        if (!token) {
          setStatus({
            isLoading: false,
            isValid: false,
            message: "No verification token provided",
          });
          return;
        }

        setStatus({
          isLoading: false,
          isValid: true,
          isVerified: false,
          isExpired: false,
          message: "Your license is ready to be verified",
        });
      } catch (error) {
        console.error("Error checking token:", error);
        setStatus({
          isLoading: false,
          isValid: false,
          message:
            error.response?.data?.message || "Failed to check token status",
        });
      }
    };

    checkTokenStatus();
  }, [token]);

  // Handle verify button click
  const handleVerify = async () => {
    if (!token) return;

    setVerifying(true);
    try {
      // Call your backend API to verify the token
      await axios.get(
        `${import.meta.env.VITE_SPARKD_API_URL}/licenses/verify/${token}`
        // `http://localhost:3000/licenses/verify/${token}`
      );

      // If successful, navigate to success page
      navigate("/license-verification-success");
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description:
          error.response?.data?.message ||
          "Failed to verify your license. Please try again or contact support.",
        variant: "destructive",
      });
      setVerifying(false);
    }
  };

  // Loading state
  if (status.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mb-4">
            <div className="border-blue-500 mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-t-2"></div>
          </div>
          <h1 className="mb-2 text-xl font-medium">Checking your license...</h1>
        </div>
      </div>
    );
  }

  // No token provided
  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <div className="mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold">Invalid Verification Link</h1>
          <p className="text-gray-600 mb-6">
            No verification token was provided. Please use the link from your
            email.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 w-full rounded px-4 py-2 text-white transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Valid token ready to be verified
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-accent">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="text-blue-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold">Verify Your License</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to verify your license and access your account.
        </p>
        <Button onClick={handleVerify} disabled={verifying}>
          {verifying ? "Verifying..." : "Verify License"}
        </Button>
      </div>
    </div>
  );
};

export default LicenseVerification;
