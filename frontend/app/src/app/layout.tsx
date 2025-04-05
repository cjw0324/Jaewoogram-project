import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../lib/auth/AuthProvider";
import { Inter } from "next/font/google";
import AuthCallbackHandler from "./components/AuthCallbackHandler";

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
  description: "OAuth 2.0 소셜 로그인 / ElastiCache Redis 동시성 이슈",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <AuthCallbackHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
