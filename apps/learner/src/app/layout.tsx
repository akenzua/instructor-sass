import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { LearnerAuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Learner Portal - Instructor SaaS",
  description: "View your lessons and manage payments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LearnerAuthProvider>{children}</LearnerAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
