import type { Metadata } from "next";
import { Geist, Geist_Mono, Oxanium, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "FlareX — Industrial Fire & Geospatial Thermal Intelligence",
  description: "FlareX: AI-powered industrial fire detection and persistent thermal-source geospatial intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oxanium.variable} ${orbitron.variable} dark h-full antialiased`}
      data-theme="dark"
    >
      <body className="w-full h-full min-h-screen bg-[#040202] text-[#fef8f6] overflow-hidden flex flex-col selection:bg-orange-500/30 selection:text-orange-200 m-0 p-0">
        {children}
      </body>
    </html>
  );
}
