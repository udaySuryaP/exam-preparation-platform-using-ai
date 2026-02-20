import { LoginForm } from "@/components/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In — KTU Exam Prep AI",
    description: "Sign in to your KTU Exam Prep AI account",
};

export default function LoginPage() {
    return <LoginForm />;
}
