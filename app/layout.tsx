import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fraktseddel AI",
  description:
    "PoC: les fraktseddel fra bilde og konverter til strukturerte data med Azure AI Foundry.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${ibmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
