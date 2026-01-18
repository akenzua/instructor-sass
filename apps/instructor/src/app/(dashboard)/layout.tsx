"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AppShell } from "@/components";
import { Box } from "@chakra-ui/react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { instructor, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !instructor) {
      router.push("/login");
    }
  }, [instructor, isLoading, router]);

  if (isLoading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        Loading...
      </Box>
    );
  }

  if (!instructor) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
