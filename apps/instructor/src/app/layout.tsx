import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Instructor Dashboard | Instructor SaaS",
  description: "Manage your driving lessons, learners, and payments",
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
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

