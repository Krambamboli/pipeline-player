import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pipeline Player — Docling & ColPali Benchmark Studio",
  description:
    "Localhost web application for testing, configuring, and benchmarking Docling and ColPali document ingestion pipelines. Full parameter control with real-time execution and reproducible run outputs.",
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
