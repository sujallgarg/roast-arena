import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ROAST ARENA — Where Rival Brands Roast & Users Pick the Winner",
  description: "The viral 1v1 brand arena. Watch rival brands roast each other round by round, vote on savage comebacks, and unlock winner perks!",
  keywords: ["ROAST ARENA", "Brand Roast", "Brand Battle", "Live Voting", "Crowdsourced Roasts"],
  openGraph: {
    title: "ROAST ARENA — Where Rival Brands Roast",
    description: "Rival brands roast each other. You decide who wins the clash.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} light`}>
      <body className="text-slate-900 antialiased selection:bg-red-500 selection:text-white min-h-screen">
        <div className="relative z-10">
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </div>
      </body>
    </html>
  );
}
