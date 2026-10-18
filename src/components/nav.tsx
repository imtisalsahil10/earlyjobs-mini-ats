"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Briefcase, Columns3, Menu, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Columns3 },
  { href: "/jobs", label: "Roles", icon: Briefcase },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Main">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
        EJ
      </span>
      <span className="text-sm font-semibold tracking-tight text-slate-900">
        EarlyJobs ATS
      </span>
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="px-5 py-5">
        <Wordmark />
      </div>
      <div className="flex-1 px-3">
        <NavLinks />
      </div>
      <div className="border-t border-slate-100 px-5 py-4">
        <p className="text-xs font-medium text-slate-900">Priya Nair</p>
        <p className="text-xs text-slate-500">Talent Acquisition</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <Wordmark />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-b border-slate-200 bg-white px-3 py-3">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
