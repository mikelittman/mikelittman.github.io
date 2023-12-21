import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mike Littman",
  description: "Learn more about Mike Littman",
  keywords: ["mike", "littman", "personal", "website"],
  metadataBase: new URL("https://mikelittman.me"),
  openGraph: {
    siteName: "Mike Littman",
    description: "Developer of software",
    url: "https://mikelittman.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
