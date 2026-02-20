import { SignupForm } from "@/components/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up — KTU Exam Prep AI",
    description: "Create your KTU Exam Prep AI account",
};

export default function SignupPage() {
    return <SignupForm />;
}
