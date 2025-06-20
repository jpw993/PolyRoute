"use client";

import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // In the future, context providers like ThemeProvider, QueryClientProvider, etc. can be added here
  return <>{children}</>;
}
