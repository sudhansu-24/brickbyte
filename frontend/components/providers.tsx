"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { AuthProvider } from "@/contexts/AuthContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </SWRConfig>
  );
}
