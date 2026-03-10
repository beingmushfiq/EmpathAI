import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmpathAI — Your Empathetic AI Companion",
  description: "A modern AI companion that listens, understands, and helps you take action. Chat, voice, and video conversations powered by advanced AI.",
  keywords: ["AI companion", "mental wellness", "AI chat", "empathy", "personal assistant"],
  authors: [{ name: "EmpathAI Team" }],
  openGraph: {
    title: "EmpathAI — Your Empathetic AI Companion",
    description: "A modern AI companion that listens, understands, and helps you take action.",
    type: "website",
  },
};

import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: undefined, variables: { colorPrimary: '#9353d3' } }}>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="font-sans antialiased">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
