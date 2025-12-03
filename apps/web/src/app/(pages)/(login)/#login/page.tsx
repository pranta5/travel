import React from "react";
import AuthLayout from "@/components/page/userComp/AuthLayoutComp";
import LoginPhComp from "@/components/page/userComp/#loginComp";

export default function LoginPage() {
  return (
    <AuthLayout FormComponent={LoginPhComp} AboutForm={"Login with OTP"} />
  );
}
