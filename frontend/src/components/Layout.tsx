import { NavLink } from "react-router-dom";
import type { PropsWithChildren } from "react";
import {
  BriefcaseBusiness,
  ChartColumn,
  Database,
  Menu,
  PlusCircle,
  TableProperties,
  UploadCloud,
  UserRoundCheck,
} from "lucide-react";
import { useState } from "react";

import { MASTER_FIELD_KEYS, MASTER_FIELD_ROUTE_LABELS } from "../constants";

const coreLinks = [
  { to: "/", label: "Dashboard", icon: ChartColumn },
  { to: "/outstanding-positions", label: "Outstanding Positions", icon: TableProperties },
  { to: "/filled-positions", label: "Filled Positions", icon: UserRoundCheck },
  { to: "/add-position", label: "Add Position", icon: PlusCircle },
  { to: "/upload", label: "Import Excel", icon: UploadCloud },
];

export default function Layout({ children }: PropsWithChildren) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent">
      <aside
        className={`sticky top-0 h-screen border-r border-[var(--border)] bg-[var(--bg-sidebar)] px-3 py-4 text-[var(--text-on-dark)] transition-all duration-200 ${collapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--sidebar-border)] bg-[var(--bg-sidebar-soft)] p-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-primary)] text-[var(--text-on-accent)]">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div>
                <p className="font-semibold">Recruitment Dashboard</p>
                <p className="text-xs text-[var(--text-on-dark-muted)]">Hiring operations cockpit</p>
              </div>
            ) : null}
          </div>
          <button
            aria-label="Toggle navigation"
            className="rounded-lg border border-[var(--sidebar-border)] bg-[var(--bg-sidebar-soft)] p-2 text-[var(--text-on-dark)] transition-all duration-200 hover:border-[var(--accent-primary)]"
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-6 space-y-5">
          <div className="space-y-2">
            {!collapsed ? <p className="px-2 text-xs uppercase tracking-[0.16em] text-[var(--text-on-dark-muted)]">Main</p> : null}
            {coreLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "border-[var(--accent-primary)] bg-[rgba(15,108,189,0.18)] text-[var(--text-on-dark)]"
                      : "border-transparent text-[var(--text-on-dark-muted)] hover:border-[var(--sidebar-border)] hover:bg-[var(--bg-sidebar-soft)] hover:text-[var(--text-on-dark)]"
                  }`
                }
                to={to}
              >
                <Icon className="h-4 w-4" />
                {!collapsed ? <span>{label}</span> : null}
              </NavLink>
            ))}
          </div>

          <div className="space-y-2">
            {!collapsed ? <p className="px-2 text-xs uppercase tracking-[0.16em] text-[var(--text-on-dark-muted)]">Master Pages</p> : null}
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-[var(--accent-primary)] bg-[rgba(15,108,189,0.18)] text-[var(--text-on-dark)]"
                    : "border-transparent text-[var(--text-on-dark-muted)] hover:border-[var(--sidebar-border)] hover:bg-[var(--bg-sidebar-soft)] hover:text-[var(--text-on-dark)]"
                }`
              }
              to="/master-pages"
            >
              <Database className="h-4 w-4" />
              {!collapsed ? <span>Master Pages</span> : null}
            </NavLink>

            {!collapsed
              ? MASTER_FIELD_KEYS.map((fieldKey) => (
              <NavLink
                key={fieldKey}
                className={({ isActive }) =>
                  `ml-3 flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-all duration-200 ${
                    isActive
                      ? "border-[var(--accent-primary)] bg-[rgba(15,108,189,0.18)] text-[var(--text-on-dark)]"
                      : "border-transparent text-[var(--text-on-dark-muted)] hover:border-[var(--sidebar-border)] hover:bg-[var(--bg-sidebar-soft)] hover:text-[var(--text-on-dark)]"
                  }`
                }
                to={`/master-pages/${fieldKey}`}
              >
                <Database className="h-3.5 w-3.5" />
                <span>{MASTER_FIELD_ROUTE_LABELS[fieldKey]}</span>
              </NavLink>
              ))
              : null}
          </div>
        </nav>
      </aside>
      <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
    </div>
  );
}
