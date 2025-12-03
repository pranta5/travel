// app/verify-email/page.tsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "@/lib/axios";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "invalid"
  >("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setMessage("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);

        if (res.data.success || res.status === 200) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");

          toast.success("Email verified! You can now log in.");

          // Optional: auto redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Verification failed. Link may be expired or already used.";

        setStatus("error");
        setMessage(errorMsg);

        toast.error(errorMsg);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-teal-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/img/logo.png"
              alt="HikeSike"
              className="h-16 w-16 mx-auto rounded-lg"
            />
            <h1 className="text-2xl font-bold text-gray-800 mt-4">HikeSike</h1>
          </div>

          {/* Loading State */}
          {status === "verifying" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600 mx-auto"></div>
              <p className="text-lg text-gray-700">Verifying your email...</p>
              <p className="text-sm text-gray-500">Please wait a moment</p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Email Verified!
                </h2>
                <p className="text-gray-600 mt-2">
                  Congratulations! Your account is now active.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                Redirecting you to login page in 3 seconds...
              </p>
              <Link
                href="/login"
                className="inline-block mt-4 px-8 py-3 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 transition"
              >
                Go to Login Now
              </Link>
            </div>
          )}

          {/* Error / Invalid State */}
          {(status === "error" || status === "invalid") && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mt-3 max-w-sm mx-auto">{message}</p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition"
                >
                  Back to Login
                </Link>
                <p className="text-sm text-gray-500">
                  Need help?{" "}
                  <Link
                    href="/contact"
                    className="text-sky-600 hover:underline"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
