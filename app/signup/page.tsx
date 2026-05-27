import { SignupForm } from "@/components/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - StitchDesk",
  description: "Create your StitchDesk account",
};

export default function SignupPage() {
  return <SignupForm />;
}
