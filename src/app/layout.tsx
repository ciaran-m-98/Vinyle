import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinyle — A daily music puzzle",
  description: "A little music mystery, every day.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link aria-label="Vinyle home" className="brand" href="/">
              <span aria-hidden="true" className="brand-mark">
                v
              </span>
              <span>vinyle</span>
            </Link>
            <nav aria-label="Main navigation" className="site-nav">
              <Link className="nav-link" href="/">
                Today
              </Link>
              <Link className="nav-link" href="/archive">
                Archive
              </Link>
            </nav>
            <button aria-label="How to play" className="help-button" type="button">
              ?
            </button>
          </header>
          <main className="min-w-0">{children}</main>
          <footer className="site-footer">
            <span>Made for the love of the liner notes.</span>
            <span>Vinyle · A daily music puzzle</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
