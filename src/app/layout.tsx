import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoJp = Noto_Sans_JP({
  variable: "--font-noto-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: false,
});

const notoSerifJp = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Nihongo Lab",
  description: "Interactive Japanese learning lab — kana, kanji, vocab, grammar, and spaced repetition.",
};

export const viewport: Viewport = {
  themeColor: "#17130e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoJp.variable} ${notoSerifJp.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div aria-hidden className="grain" />
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
          <Nav />
          <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
