import type { Metadata } from "next";
import DocsClient from "./docs-client";

export const metadata: Metadata = {
  title: "grove — Docs",
  description: "Self-hosting, setup, and integration docs for grove.",
};

export default function DocsPage() {
  return <DocsClient />;
}
