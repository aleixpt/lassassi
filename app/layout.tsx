import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "L'assassí",
  description: "Joc d'assassinats",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
