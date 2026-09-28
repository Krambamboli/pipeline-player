// Copyright (C) 2024 Oliver Schneider
//
// This file is part of Pipeline Player.
// SPDX-License-Identifier: GPL-3.0-or-later
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

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
