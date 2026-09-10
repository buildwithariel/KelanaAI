import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";
import Logo from "../components/Logo";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://kelana-ai-ashy.vercel.app";
const DESCRIPTION =
  "Say where you're going and what you can spend. KelanaAI writes the day-by-day plan: morning, afternoon, and evening.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "KelanaAI travel planner",
  description: DESCRIPTION,
  openGraph: {
    title: "KelanaAI travel planner",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "KelanaAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KelanaAI travel planner",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${geistSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-night font-sans text-paper">
        <AuthProvider>{children}</AuthProvider>

        <footer className="mt-auto border-t border-line bg-deep">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <p className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-paper">
                <Logo className="h-7 w-7 shrink-0" />
                <span>
                  Kelana<span className="text-signal">AI</span>
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                Itineraries written by Amazon Bedrock, priced against the budget
                you actually have.
              </p>
            </div>

            <nav aria-label="Footer">
              <p className="font-board text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
                Elsewhere
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    className="text-paper/80 transition hover:text-signal focus-visible:text-signal focus-visible:outline-none"
                    href="/#plan"
                  >
                    Plan a trip
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          <div className="border-t border-line/60">
            <p className="mx-auto max-w-6xl px-6 py-5 font-board text-[11px] tracking-[0.1em] text-mist">
              © {new Date().getFullYear()} KelanaAI · Alkademi AI Native
              Bootcamp
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
