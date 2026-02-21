import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mike Littman | Software + AI Engineer",
  description:
    "Mike Littman builds production software and AI systems with OpenAI, Anthropic, and MCP-based tooling.",
  keywords: [
    "Mike Littman",
    "Software Engineer",
    "AI Engineer",
    "OpenAI",
    "Anthropic",
    "Model Context Protocol",
    "MCP",
  ],
  metadataBase: new URL("https://mikelittman.me"),
  openGraph: {
    siteName: "Mike Littman",
    title: "Mike Littman | Software + AI Engineer",
    description:
      "Building production AI systems with OpenAI, Anthropic, and MCP tooling.",
    url: "https://mikelittman.me",
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
