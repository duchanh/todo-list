"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Plus, RefreshCw } from "lucide-react";

import type { Member, TodayResponse, TodayTask } from "@/lib/types";
import { currentDate, fetcher } from "../components/constants";
import { DatePickerButton } from "../components/DatePickerButton";
import { useTaskModal } from "../components/TaskModalContext";
import { StateMessage, TaskRow } from "../components/TaskBits";

type Filter = "all" | Member;

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(currentDate());
  const [filter, setFilter] = useState<Filter>("all");
  const { openCreate, openEdit } = useTaskModal();
  const { data, error, isLoading, mutate } = useSWR<TodayResponse>(
    `/api/today?date=${selectedDate}`,
    fetcher,
    { revalidateOnFocus: true },
  );

  const filteredTasks = useMemo(() => {
    if (!data) {
      return [];
    }

    return filter === "all"
      ? data.tasks
      : data.tasks.filter((task) => task.assignees.includes(filter));
  }, [data, filter]);

  async function toggleTask(task: TodayTask, member: Member) {
    await fetch("/api/completions/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        member,
        date: data?.date ?? selectedDate,
      }),
    });
    mutate();
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    mutate();
  }

  const completionPercent = data?.stats.totalTasks
    ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
    : 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Today</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {data?.stats.totalTasks ?? 0} task trong ngày đang chọn
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DatePickerButton onChange={setSelectedDate} value={selectedDate} />
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 text-sm font-medium"
            onClick={() => mutate()}
            type="button"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 text-sm font-medium text-white"
            onClick={() => openCreate(selectedDate)}
            type="button"
          >
            <Plus size={16} />
            Thêm task
          </button>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        <ProgressPanel
          detail={`${completionPercent}% đã xong toàn bộ`}
          label="Tổng công việc"
          tone="overall"
          value={`${data?.stats.completedTasks ?? 0}/${data?.stats.totalTasks ?? 0}`}
        />
        <ProgressPanel
          detail="Phần việc của chồng"
          label="Chồng"
          tone="husband"
          value={`${data?.stats.husband.completed ?? 0}/${data?.stats.husband.total ?? 0}`}
        />
        <ProgressPanel
          detail="Phần việc của vợ"
          label="Vợ"
          tone="wife"
          value={`${data?.stats.wife.completed ?? 0}/${data?.stats.wife.total ?? 0}`}
        />
      </section>

      <section className="flex flex-wrap gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          Tất cả
        </FilterButton>
        <FilterButton
          active={filter === "husband"}
          onClick={() => setFilter("husband")}
        >
          Chồng
        </FilterButton>
        <FilterButton active={filter === "wife"} onClick={() => setFilter("wife")}>
          Vợ
        </FilterButton>
      </section>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
        {isLoading ? (
          <StateMessage text="Đang tải checklist..." />
        ) : error ? (
          <StateMessage text="Chưa thể tải dữ liệu." />
        ) : filteredTasks.length === 0 ? (
          <StateMessage text="Chưa có công việc nào cho ngày này." />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filteredTasks.map((task) => (
              <TaskRow
                filter={filter}
                key={task.id}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => openEdit(task)}
                onToggle={(member) => toggleTask(task, member)}
                task={task}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProgressPanel({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "overall" | "husband" | "wife";
}) {
  const toneClass = {
    overall: "bg-[var(--accent)] text-white",
    husband: "bg-[#274c77] text-white",
    wife: "bg-[#9b3d54] text-white",
  }[tone];

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClass}`}>
          {value}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
    </article>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--border)] bg-[var(--panel)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
