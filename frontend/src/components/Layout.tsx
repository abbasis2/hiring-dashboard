import { NavLink } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { BriefcaseBusiness, ChartColumn, Menu, PlusCircle, TableProperties, UploadCloud, UserRoundCheck } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Dashboard", icon: ChartColumn },
  { to: "/outstanding-positions", label: "Outstanding Positions", icon: TableProperties },
  { to: "/filled-positions", label: "Filled Positions", icon: UserRoundCheck },
  { to: "/add-position", label: "Add Position", icon: PlusCircle },
  { to: "/upload", label: "Import Excel", icon: UploadCloud }
];

export default function Layout({ children }: PropsWithChildren) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`border-r border-[var(--border)] bg-[color:rgba(10,20,38,0.95)] px-3 py-4 transition-all duration-200 ${collapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-slate-950">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            {!collapsed ? (
              <div>
                <p className="font-semibold">Recruitment Dashboard</p>
                <p className="text-xs text-[var(--text-secondary)]">Hiring operations cockpit</p>
              </div>
            ) : null}
          </div>
          <button
            aria-label="Toggle navigation"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2 transition-all duration-200 hover:bg-[#223452]"
            onClick={() => setCollapsed((value) => !value)}
            type="button"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        <nav className="mt-6 space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border-sky-400/45 bg-sky-400/12 text-sky-200"
                    : "border-transparent text-[var(--text-secondary)] hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                }`
              }
              to={to}
            >
              <Icon className="h-4 w-4" />
              {!collapsed ? <span>{label}</span> : null}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
    </div>
  );
}
