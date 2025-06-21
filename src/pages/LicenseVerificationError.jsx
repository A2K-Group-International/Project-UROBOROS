import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LicenseVerificationError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Get error message from URL parameters
    const message = searchParams.get("message") || "Failed to verify license";
    setErrorMessage(message);
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mb-4 text-red-500">
          {/* Error icon */}
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
        <h1 className="mb-2 text-2xl font-bold">Verification Failed</h1>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/")}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 w-full rounded px-4 py-2 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LicenseVerificationError;
