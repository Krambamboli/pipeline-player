"use client";

// Copyright (C) 2026 olischn
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


/**
 * TabNav — Global pipeline step navigation bar
 * Sits at the top of every page. Uses Next.js pathname to highlight
 * the active tab.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "📄 Step 1: Docling Parser", id: "tab-docling" },
  { href: "/chunk", label: "✂️ Step 2: Chunk & Vectorize", id: "tab-chunk" },
  { href: "/inspector", label: "🔍 Step 3: Vector DB Inspector", id: "tab-inspector" },
  { href: "/enrich", label: "🧠 Step 4: Enrich Collection", id: "tab-enrich" },
  { href: "/retrieve", label: "🔎 Step 5: Retrieval", id: "tab-retrieve" },
  // Visual separator handled via CSS gap — ColPali parallel pipeline
  { href: "/colpali", label: "🖼️ ColPali: Process", id: "tab-colpali", group: "colpali" },
  { href: "/colpali/retrieve", label: "🔎 ColPali: Retrieve", id: "tab-colpali-retrieve", group: "colpali" },
  // Batch tool: whole course folder → hybrid + ColPali collections
  { href: "/rag-tester", label: "🧪 RAG Tester", id: "tab-rag-tester", group: "rag" },
  // Query both collections (hybrid + MaxSim) and fuse them with a Python reranker
  { href: "/fusion", label: "🔀 Fusion Retriever", id: "tab-fusion", group: "rag" },
] as const;

/**
 * Global top navigation bar component rendered across all pages via the root layout (`app/layout.tsx`).
 * Receives no props; reads the current route via Next.js `usePathname()`.
 * Renders navigation `Link` tabs for Steps 1–5, ColPali, RAG Tester, and Fusion Retriever with active-tab highlighting and group dividers.
 */
export default function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="tabnav" aria-label="Pipeline steps">
      <div className="tabnav__logo">
        <span className="tabnav__logo-icon">⚡</span>
        <span className="tabnav__logo-text">Pipeline Player</span>
        <span className="tabnav__logo-sub">Docling &amp; ColPali Studio</span>
      </div>
      <div className="tabnav__tabs">
        {TABS.map((tab, idx) => {
          // Exact match for root, colpali root, and colpali/retrieve
          // Prefix match for all others
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : tab.href === "/colpali"
              ? pathname === "/colpali"
              : pathname.startsWith(tab.href);

          // Add a visual separator before the first tab of each group (ColPali, RAG Tester)
          const prev = idx > 0 ? TABS[idx - 1] : undefined;
          const group = "group" in tab ? tab.group : undefined;
          const prevGroup = prev && "group" in prev ? prev.group : undefined;
          const isFirstColpali = group !== undefined && group !== prevGroup;

          return (
            <Link
              key={tab.href}
              id={tab.id}
              href={tab.href}
              className={`tabnav__tab ${isActive ? "tabnav__tab--active" : ""}`}
              style={isFirstColpali ? { borderLeft: "1px solid var(--c-border)", marginLeft: 8, paddingLeft: 16 } : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
