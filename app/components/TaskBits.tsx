"use client";

import { Check, Pencil, Trash2, UserRound, UsersRound } from "lucide-react";

import type { Member, ScheduleType, TodayTask } from "@/lib/types";
import { memberDisplay } from "./constants";
import type { ManagedTask } from "./types";

type Filter = "all" | Member;

export function TaskRow({
  task,
  filter,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: TodayTask;
  filter: Filter;
  onToggle: (member: Member) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const visibleMembers =
    filter === "all"
      ? task.assignees
      : task.assignees.filter((member) => member === filter);

  return (
    <article className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-base font-semibold">{task.title}</h3>
          <TaskBadges task={task} />
        </div>
        {task.note ? (
          <p className="mt-1 break-words text-sm text-[var(--muted)]">{task.note}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleMembers.map((member) => (
            <button
              className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium ${
                task.completions[member]
                  ? "border-[var(--accent)] bg-[#dceee9] text-[var(--accent-strong)]"
                  : "border-[var(--border)] bg-white text-[var(--foreground)]"
              }`}
              key={member}
              onClick={() => onToggle(member)}
              type="button"
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded border ${
                  task.completions[member]
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[#a8a29a]"
                }`}
              >
                {task.completions[member] ? <Check size={14} /> : null}
              </span>
              {memberDisplay[member]}
            </button>
          ))}
        </div>
      </div>

      <RowActions onDelete={onDelete} onEdit={onEdit} />
    </article>
  );
}

export function TaskBadges({
  task,
}: {
  task: Pick<ManagedTask | TodayTask, "scheduleType" | "assignees" | "date">;
}) {
  return (
    <>
      <span className="rounded-md bg-[#e6e1d6] px-2 py-1 text-xs font-medium text-[#4b453b]">
        {task.scheduleType === "daily"
          ? "Hằng ngày"
          : `Một ngày${task.date ? `: ${task.date}` : ""}`}
      </span>
      {task.assignees.length === 2 ? (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#e5f0ed] px-2 py-1 text-xs font-medium text-[#176b63]">
          <UsersRound size={13} />
          Cả hai
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-md bg-[#eef2f7] px-2 py-1 text-xs font-medium text-[#274c77]">
          <UserRound size={13} />
          {memberDisplay[task.assignees[0]]}
        </span>
      )}
    </>
  );
}

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 md:justify-end">
      <button
        aria-label="Sửa task"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-white"
        onClick={onEdit}
        title="Sửa task"
        type="button"
      >
        <Pencil size={16} />
      </button>
      <button
        aria-label="Xóa task"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-white text-[var(--danger)]"
        onClick={onDelete}
        title="Xóa task"
        type="button"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function scheduleLabel(scheduleType: ScheduleType) {
  return scheduleType === "daily" ? "Hằng ngày" : "Một ngày";
}

export function StateMessage({ text }: { text: string }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">{text}</div>
  );
}
