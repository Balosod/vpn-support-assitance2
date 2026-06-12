import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VPN Support Assistant",
  description: "AI-powered chat for VPN help",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
