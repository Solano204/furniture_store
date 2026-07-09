import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Container from "@/components/global/Container";
import Navbar from "@/components/navbar/Navbar";
import Providers from "./providers";
import { Inter } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Furniture Store",
  description: "Browse and shop furniture online",
};

// Every page depends on the session cookie transitively (the Navbar's
// CartButton reads it on every route), so there's nothing here Next.js can
// usefully pre-render statically at build time.
export const dynamic = "force-dynamic";

import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({subsets: ['latin']})
import { Provider } from 'react-redux';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers>
            <Navbar />
            <Container className="py-20">{children}</Container>
          </Providers>
        </body>
      </html>
    // </ClerkProvider>
  );
}
