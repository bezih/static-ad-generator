import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdForge — AI-Powered Static Ad Generator",
  description:
    "Generate high-converting static ads for any brand. Powered by multi-agent research and AI image generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full font-body antialiased noise">
        {children}
      </body>
    </html>
  );
}
