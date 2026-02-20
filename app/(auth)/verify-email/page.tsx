import { OTPInput } from "@/components/auth/OTPInput";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verify Email — KTU Exam Prep AI",
    description: "Verify your email address",
};

export default function VerifyEmailPage() {
    return <OTPInput />;
}
