"use client";

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
] as const;

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

          // Add visual separator before the first ColPali tab
          const isFirstColpali = "group" in tab && tab.group === "colpali" && (idx === 0 || !("group" in TABS[idx - 1]));

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
