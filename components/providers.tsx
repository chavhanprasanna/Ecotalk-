'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { SocketProvider } from '@/providers/socket-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SocketProvider>
        {children}
        <Toaster />
      </SocketProvider>
    </ThemeProvider>
  );
}