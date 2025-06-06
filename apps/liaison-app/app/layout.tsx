import type { Metadata } from "next";
import "./globals.css";
import { Space_Mono } from "next/font/google";
import Providers from "@/providers/privy-auth-provider";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const space_mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={space_mono.className}>
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
