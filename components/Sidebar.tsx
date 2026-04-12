"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-black/20 flex flex-col pt-2 pb-4 px-2 gap-1">
      {title && (
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-2 py-1 mb-1">
          {title}
        </p>
      )}
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-indigo-600/20 text-indigo-400"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
