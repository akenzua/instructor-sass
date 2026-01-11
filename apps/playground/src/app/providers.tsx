"use client";

import { AppProvider } from "@acme/ui";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
