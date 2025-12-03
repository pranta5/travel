"use client";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";

interface LoginFormInputs {
  phone: string;
}

const LoginPhComp = () => {
  // useForm setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormInputs>();

  // submit
  const onSubmit = async (data: LoginFormInputs) => {
    console.log("Form Data:", data);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <span className="text-sm text-gray-600">Phone number</span>
          <input
            type="tel"
            placeholder="e.g. 123456789"
            className={`mt-1 text-gray-500 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
              errors.phone ? "border-red-500" : ""
            }`}
            {...register("phone", {
              required: "Phone number is required",
              minLength: {
                value: 7,
                message: "Too short to be a phone number",
              },
            })}
          />
        </label>

        {errors.phone && (
          <p className="text-red-600 text-sm -mt-2">{errors.phone.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white p-2 w-full rounded"
        >
          {isSubmitting ? "Sending..." : "Send OTP"}
        </button>
        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have account?{" "}
          <Link href="/register">
            <button className="text-sky-600 font-semibold">Register Now</button>
          </Link>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">
          login with email and password?{" "}
          <Link href="/email-login">
            <button className="text-sky-600 font-semibold">Login</button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPhComp;
