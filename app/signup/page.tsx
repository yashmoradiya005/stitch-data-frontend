import { SignupForm } from "@/components/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Stitch Data",
  description: "Create your Stitch Data account",
};

export default function SignupPage() {
  return <SignupForm />;
}
