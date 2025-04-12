"use client"

import { Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/provider";



const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-white">
      <body
        className={`${montserrat.variable} antialiased `}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          
        </Providers>
      </body>
    </html>
  );
}
