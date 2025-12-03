import AuthLayout from "@/components/page/userComp/AuthLayoutComp";
import EmailLoginComp from "@/components/page/userComp/emailLoginComp";

export default function LoginWithEmail() {
  return (
    <AuthLayout
      FormComponent={EmailLoginComp}
      AboutForm={"Login with email and password"}
    />
  );
}
