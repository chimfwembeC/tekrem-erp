import React, { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Toaster } from 'sonner';

interface AppProviderProps {
  // Add any additional props here
}

export default function AppProvider({ 
  children 
}: PropsWithChildren<AppProviderProps>) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="tekrem-ui-theme">
      <Toaster position="top-right" />
      {children}
    </ThemeProvider>
  );
}
