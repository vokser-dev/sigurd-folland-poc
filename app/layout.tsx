import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  variable: "--font-display",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Norgesdekk — Leveransedokument AI",
  description:
    "PoC for Norgesdekk: les leveransedokument / fraktseddel fra PDF og hent strukturerte data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      className={`${manrope.variable} ${barlow.variable} ${ibmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
