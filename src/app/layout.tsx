import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";

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
    "Live, interactive demonstrations of academic engineering and computer-science projects, re-rendered in the browser alongside the original source code.",
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
      <body className="min-h-full flex flex-col text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:text-slate-900"
        >
          Skip to content
        </a>
        <SiteNav />
        <div id="main" className="flex-1">
          {children}
        </div>
        <footer className="mt-24 border-t border-white/10 bg-slate-950/40 px-6 py-10 text-xs text-white/50">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              Built from undergraduate coursework at Dartmouth (2018–2021) and
              re-implemented in TypeScript as an interactive portfolio.
            </div>
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <Link href="/about/" className="hover:text-white">
                About
              </Link>
              <a
                href="https://github.com/Akosah285/technical-projects-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
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
