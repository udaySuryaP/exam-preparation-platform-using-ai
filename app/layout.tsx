import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KTU Exam Prep AI — Ace Your KTU Exams with AI",
  description:
    "AI-powered exam preparation platform for APJ Abdul Kalam Technological University students. Get personalized Q&A, exam pattern analysis, and smart study tools.",
  keywords: ["KTU", "exam prep", "AI", "study", "APJ Abdul Kalam Technological University"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
