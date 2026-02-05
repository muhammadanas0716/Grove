import Link from "next/link";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={`mt-16 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)] ${
        className ?? ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex flex-wrap items-center gap-4"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          <Link href="/docs" className="hover:text-[var(--foreground)] transition">
            Docs
          </Link>
          <Link href="/terms" className="hover:text-[var(--foreground)] transition">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[var(--foreground)] transition">
            Privacy
          </Link>
          <a
            href="https://github.com/muhammadanas0716/Grove"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--foreground)] transition"
          >
            OSS Repo
          </a>
        </div>
        <a
          href="https://x.com/MuhammadAnas707"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--muted)] hover:text-[var(--foreground)] transition"
          style={{ fontFamily: "var(--font-mono), monospace" }}
        >
          X: @MuhammadAnas707
        </a>
      </div>
    </footer>
  );
}
