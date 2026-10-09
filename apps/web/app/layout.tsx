import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AuditOps | Repository Security Scanner",
    template: "%s | AuditOps",
  },
  description: "Upload repository zips and scan for security, compliance, and VAPT risks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}