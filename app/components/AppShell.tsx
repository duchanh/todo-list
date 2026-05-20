"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, Inbox, Plus, Search, Tags } from "lucide-react";

import { TaskModalProvider, useTaskModal } from "./TaskModalContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TaskModalProvider>
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <Sidebar />
        <section className="min-w-0 px-4 py-6 sm:px-8 lg:px-12">{children}</section>
      </div>
    </TaskModalProvider>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { openCreate } = useTaskModal();

  return (
    <aside className="border-b border-[var(--border)] bg-[var(--sidebar)] px-3 py-3 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="mb-6 flex items-center justify-between gap-3 px-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold">Todo</span>
        </div>
      </div>

      <button
        className="mb-3 inline-flex h-10 w-full items-center justify-start gap-2 rounded-md px-3 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--active-bg)]"
        onClick={() => openCreate()}
        type="button"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white">
          <Plus size={15} />
        </span>
        Add task
      </button>

      <nav className="grid gap-1">
        <SidebarLink
          active={pathname === "/today"}
          count={pathname === "/today" ? undefined : undefined}
          href="/today"
          icon={<CalendarDays size={17} />}
          label="Today"
        />
        <SidebarLink
          active={pathname === "/tasks"}
          href="/tasks"
          icon={<Inbox size={17} />}
          label="Task"
        />
        <SidebarLink
          active={pathname === "/stats"}
          href="/stats"
          icon={<BarChart3 size={17} />}
          label="Thống kê"
        />
      </nav>
    </aside>
  );
}

function SidebarLink({
  active,
  href,
  icon,
  label,
  count,
}: {
  active: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <Link
      className={`inline-flex h-9 items-center justify-between rounded-md px-3 text-sm ${
        active
          ? "bg-[var(--active-bg)] font-medium text-[var(--accent)]"
          : "text-[var(--foreground)] hover:bg-[#f3f0e9]"
      }`}
      href={href}
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {typeof count === "number" ? (
        <span className="text-xs text-[var(--muted)]">{count}</span>
      ) : null}
    </Link>
  );
}
