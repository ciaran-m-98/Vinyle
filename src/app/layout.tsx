import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinyle — Daily album guessing game",
  description: "Daily album guessing game.",
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
          <main className="min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
