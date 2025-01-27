'use client';
import { ThemeProvider } from './theme-provider';
import { Toaster } from "@/components/ui/toaster";

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
    {/* <Toaster />HERE WRAP ALL APPLICATION BECAUSE IF HAPPEN A ERROR THIS TOASTER WILL APPEAR*/}
      <Toaster /> 
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
}
export default Providers;