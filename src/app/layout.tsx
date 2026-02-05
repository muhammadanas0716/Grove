import type { Metadata } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono, Zilla_Slab } from "next/font/google";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ThemeScript } from "./theme-script";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const zillaSlab = Zilla_Slab({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "grove — Upload videos, photos, and get feedback",
  description: "Simple content review and collaboration. Upload videos, photos, articles. Comment and collaborate without the complexity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${ibmPlexMono.variable} ${zillaSlab.variable} antialiased`}
      >
        <ThemeScript />
        <ThemeProvider>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
