import { Geist, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const body = Geist({
  subsets: ["latin"],
  variable: "--next-font-body",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--next-font-display",
  display: "swap",
});

export const metadata = {
  title: { default: "GigCraft | Freelance Gig Marketplace", template: "%s | GigCraft" },
  description:
    "Discover vetted freelancers, buy digital services with milestone-based demo escrow, and manage your orders in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}