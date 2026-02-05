"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo } from "react";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url || url.trim() === "") {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is not set. Please run 'npx convex dev' in your terminal to initialize Convex and get your deployment URL."
      );
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      throw new Error(
        `NEXT_PUBLIC_CONVEX_URL must be an absolute URL. Got: "${url}". Please check your .env.local file.`
      );
    }
    return new ConvexReactClient(url);
  }, []);

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
