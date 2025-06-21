import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LicenseVerificationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to login or dashboard after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mb-4 text-green-500">
          {/* Success icon or animation */}
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold">
          License Verified Successfully!
        </h1>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 w-full rounded px-4 py-2 text-white transition-colors"
        >
          Log In Now
        </button>
        <p className="text-gray-500 mt-4 text-sm">
          You&apos;ll be automatically redirected to the login page in 5
          seconds.
        </p>
      </div>
    </div>
  );
};

export default LicenseVerificationSuccess;
