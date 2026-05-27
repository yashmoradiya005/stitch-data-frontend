import { LoginForm } from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - StitchDesk",
  description: "Sign in to your StitchDesk account",
};

export default function LoginPage() {
  return <LoginForm />;
}
