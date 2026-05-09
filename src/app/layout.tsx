import type { Metadata } from "next";
import Link from "next/link";
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <div id="main" className="flex-1">
          {children}
        </div>
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 px-6 py-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Original Python submissions written for Dartmouth COSC 1 (FA18);
              re-rendered here in TypeScript as a personal portfolio.
            </div>
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/about/" className="hover:text-foreground">
                About
              </Link>
              <a
                href="https://github.com/Akosah285/technical-projects-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Source
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
