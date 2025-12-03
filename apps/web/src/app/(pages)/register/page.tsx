import React from "react";
import AuthLayout from "@/components/page/userComp/AuthLayoutComp";
import RegisterForm from "@/components/page/userComp/registerComp";

export default function RegisterPage() {
  return <AuthLayout FormComponent={RegisterForm} AboutForm={"Register"} />;
}
