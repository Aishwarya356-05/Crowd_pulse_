import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CrowdPulse | Emergency Intelligence",
  description: "Real-time crowd-sourced emergency dispatch system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white selection:bg-emergency-critical selection:text-white">
        {children}
      </body>
    </html>
  );
}
