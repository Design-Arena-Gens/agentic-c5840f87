import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Monky Odyssey",
  description: "An immersive narrative video experience about the curious monky explorers of the rainforest canopy.",
  openGraph: {
    title: "Monky Odyssey",
    description: "Dive into a cinematic journey following an adventurous monky through the rainforest.",
    url: "https://agentic-c5840f87.vercel.app",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Monky Odyssey",
    description: "Watch the original monky short-form documentary crafted for the web."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.variable}>{children}</body>
    </html>
  );
}
