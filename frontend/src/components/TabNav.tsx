"use client";

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
];

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
        {TABS.map((tab) => {
          // exact match for root, prefix match for others
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              id={tab.id}
              href={tab.href}
              className={`tabnav__tab ${isActive ? "tabnav__tab--active" : ""}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
