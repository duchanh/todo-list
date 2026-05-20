"use client";

import useSWR from "swr";

import { fetcher, memberDisplay } from "../components/constants";
import type { StatsResponse } from "../components/types";

export default function StatsPage() {
  const { data: stats } = useSWR<StatsResponse>("/api/stats", fetcher, {
    revalidateOnFocus: true,
  });

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_360px]">
      <article className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
        <h1 className="text-2xl font-semibold">Thống kê 7 ngày</h1>
        <div className="mt-5 grid grid-cols-7 items-end gap-2">
          {(stats?.lastSeven ?? []).map((day) => (
            <div className="grid gap-2" key={day.date}>
              <div className="flex h-32 items-end rounded-md bg-[var(--neutral-track)] p-1">
                <div
                  className="w-full rounded bg-[var(--accent)]"
                  style={{ height: `${Math.max(day.percent, 6)}%` }}
                  title={`${day.completed}/${day.total}`}
                />
              </div>
              <div className="text-center text-xs text-[var(--muted)]">
                <div>{day.date.slice(5)}</div>
                <div className="font-medium text-[var(--foreground)]">
                  {day.completed}/{day.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
        <h2 className="text-base font-semibold">Streak hằng ngày</h2>
        <div className="mt-4 grid gap-3">
          {(stats?.streaks ?? []).length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Chưa có task hằng ngày để tính streak.
            </p>
          ) : (
            stats?.streaks.map((item) => (
              <div
                className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-white px-3 py-2"
                key={item.taskId}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {item.assignees.length === 2
                      ? "Cả hai"
                      : memberDisplay[item.assignees[0]]}
                  </p>
                </div>
                <span className="rounded-md bg-[#e5f0ed] px-2 py-1 text-sm font-semibold text-[var(--accent-strong)]">
                  {item.streak} ngày
                </span>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
}
