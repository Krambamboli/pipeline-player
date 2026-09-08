import type { Metadata } from "next";
import "./globals.css";
import TabNav from "@/components/TabNav";

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
      <body>
        {/* Global tab navigation across all pipeline steps */}
        <TabNav />
        {/* Page content fills remaining height */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100vh - 48px)" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
