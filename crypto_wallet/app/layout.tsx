import type { Metadata } from "next";
import { FC } from "react";
import { ContextProvider } from "@/contexts/ContextProvider";
import Notifications from "@/components/Notification";
import Footer from "@/components/Footer";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";

import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Solana Token Creator",
  description: "Solana multifunctionality app",
};

const RootLayout: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning className={cn("min-h-screen bg-default-900 font-sans antialiased", fontSans.variable)}>
        <ContextProvider>
          <Notifications />
          {children}
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
};

export default RootLayout;
