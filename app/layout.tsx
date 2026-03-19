import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HeyAspen Portal",
  description: "Restaurant management for Aspen-area restaurants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
