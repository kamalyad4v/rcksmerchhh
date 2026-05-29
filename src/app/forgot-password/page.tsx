import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | RCK'S MERCHHH",
  description: "Reset your password securely via OTP email verification on RCK'S MERCHHH.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
