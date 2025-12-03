// components/RegisterForm.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { redirect, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "react-toastify";

interface RegisterFormInputs {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const RegisterForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>();

  const [showPassword, setShowPassword] = useState(false);

  // components/RegisterForm.tsx
  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const res = await api.post("/auth/register", data);

      const user = res.data.user;
      // Success Toast 1
      toast.success("Registered successfully!");

      // Success Toast 2 (appears after first one)
      setTimeout(() => {
        toast.info(
          "Please check your email and click the link to verify your account."
        );
      }, 800);
      reset();
      router.push("/login");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Try again.";

      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 max-w-md mx-auto"
    >
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
          className={`mt-1 block w-full rounded border px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1.5">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Please enter a valid email",
            },
          })}
          type="email"
          className={`mt-1 block w-full rounded border px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="you@example.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1.5">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          {...register("phone", {
            required: "Phone is required",
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: "Enter a valid Indian mobile number",
            },
          })}
          type="tel"
          className={`mt-1 block w-full rounded border px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="9876543210"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-red-600 text-sm mt-1.5">{errors.phone.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative mt-1">
          <input
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            type={showPassword ? "text" : "password"}
            className={`block w-full rounded border px-4 py-2.5 pr-16 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500 transition ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="••••••••"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-sm mt-1.5">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </button>

      <div className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-sky-600 font-semibold hover:underline"
        >
          Login Now
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
