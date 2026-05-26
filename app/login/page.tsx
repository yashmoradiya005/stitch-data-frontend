import { LoginForm } from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Stitch Data",
  description: "Sign in to your Stitch Data account",
};

export default function LoginPage() {
  return <LoginForm />;
}
