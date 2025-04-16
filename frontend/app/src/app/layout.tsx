// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "../lib/auth/AuthProvider";
import Headers from "./header";
import Footer from "./footer";
import ClientProviders from "@/components/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "jaewoo toy project",
  description: "Instagram 기능들을 구현하며 학습하는 project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className={inter.className}>
        <AuthProvider>
          <ClientProviders>
            <div className="flex flex-col min-h-screen">
              <Headers />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  );
}
