// components/EmailLoginComp.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { useState } from "react";
import { toast } from "react-toastify";
interface EmailLoginFormInputs {
  email: string;
  password: string;
}

const EmailLoginComp = () => {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmailLoginFormInputs>();

  const onSubmit = async (data: EmailLoginFormInputs) => {
    try {
      console.log("Logging in with:", data);

      const res = await api.post("/auth/login", data);

      // Success: cookies are set automatically
      const user = res.data.user;

      // Update global auth state
      login(user);
      toast.success("Logged in successfully!");

      // Redirect
      router.push("/dashboard/profile");

      reset(); // optional: clear form
    } catch (err: any) {
      console.error("Login failed:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password";

      toast.error(message);

      // Show error below button
      setError("root", { message });
    }
  };
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!resendEmail || !resendEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setResending(true);
      await api.post("/auth/resend-verify", { email: resendEmail });

      toast.success("Verification email sent! Check your inbox.");
      setResendEmail("");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to send email. Try again."
      );
    } finally {
      setResending(false);
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            placeholder="xyz@gmail.com"
            className={`mt-1 text-gray-500 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Invalid email address",
              },
            })}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </label>

        <label className="block">
          <span className="text-sm text-gray-600">Enter Password</span>
          <input
            type="password"
            placeholder="••••••••"
            className={`mt-1 text-gray-500 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </label>

        {/* Global error (from server) */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {errors.root.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white p-3 w-full rounded font-medium hover:bg-sky-700 transition"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{" "}
          <Link href="/register">
            <span className="text-sky-600 font-semibold hover:underline">
              Register Now
            </span>
          </Link>
        </div>
      </form>
      {/* Resend Verification Link */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 text-gray-600">
        <p className="text-sm text-gray-600 text-center mb-3">
          Didn't receive verification email?
        </p>
        <div className="flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            disabled={resending}
          />
          <button
            onClick={handleResendVerification}
            disabled={resending || !resendEmail}
            className="px-4 py-2 bg-sky-600 text-white rounded text-sm font-medium hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLoginComp;
