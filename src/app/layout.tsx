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
  title: "Akwasi Akosah — Technical Project Portfolio",
  description:
    "Live, interactive demonstrations of academic engineering and computer science projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {children}
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 px-6 py-6 text-xs text-zinc-500 dark:text-zinc-400">
          Originally from Dartmouth COSC 1, FA18; reimplemented and presented as
          a personal portfolio.
        </footer>
      </body>
    </html>
  );
}
