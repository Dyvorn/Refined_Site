import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Lennard's Projects & YouTube Showcase",
  description: "A showcase of my YouTube videos, interactive projects, and blog.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="nav-header">
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            <span className="text-gradient">Lennard.</span>
          </Link>
          <nav className="nav-links">
            <Link href="/projects">Projects</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
