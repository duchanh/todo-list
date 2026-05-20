"use client";

import { FormEvent, useMemo, useState } from "react";
import useSWR from "swr";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";

import type { Member, ScheduleType, TodayResponse, TodayTask } from "@/lib/types";

type Filter = "all" | Member;

type StatsResponse = {
  lastSeven: Array<{
    date: string;
    total: number;
    completed: number;
    percent: number;
  }>;
  streaks: Array<{
    taskId: string;
    title: string;
    assignees: Member[];
    streak: number;
  }>;
};

type TaskForm = {
  id?: string;
  title: string;
  note: string;
  assigneeMode: "husband" | "wife" | "both";
  scheduleType: ScheduleType;
  date: string;
  active: boolean;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const emptyForm: TaskForm = {
  title: "",
  note: "",
  assigneeMode: "husband",
  scheduleType: "daily",
  date: new Date().toISOString().slice(0, 10),
  active: true,
};

const memberLabels: Record<Member, string> = {
  husband: "Chong",
  wife: "Vo",
};

const memberDisplay: Record<Member, string> = {
  husband: "Chồng",
  wife: "Vợ",
};

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<TodayResponse>(
    "/api/today",
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );
  const { data: stats, mutate: mutateStats } = useSWR<StatsResponse>(
    "/api/stats",
    fetcher,
    {
      revalidateOnFocus: true,
    },
  );

  const filteredTasks = useMemo(() => {
    if (!data) {
      return [];
    }

    if (filter === "all") {
      return data.tasks;
    }

    return data.tasks.filter((task) => task.assignees.includes(filter));
  }, [data, filter]);

  async function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      note: form.note,
      assignees: toAssignees(form.assigneeMode),
      scheduleType: form.scheduleType,
      date: form.scheduleType === "one_day" ? form.date : null,
      active: form.active,
    };

    const response = await fetch(form.id ? `/api/tasks/${form.id}` : "/api/tasks", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      return;
    }

    setForm(emptyForm);
    setIsFormOpen(false);
    mutate();
    mutateStats();
  }

  async function toggleTask(task: TodayTask, member: Member) {
    await fetch("/api/completions/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        member,
        date: data?.date,
      }),
    });

    mutate();
    mutateStats();
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    mutate();
    mutateStats();
  }

  function editTask(task: TodayTask) {
    setForm({
      id: task.id,
      title: task.title,
      note: task.note ?? "",
      assigneeMode:
        task.assignees.length === 2 ? "both" : task.assignees[0] ?? "husband",
      scheduleType: task.scheduleType,
      date: task.date ?? data?.date ?? emptyForm.date,
      active: task.active,
    });
    setIsFormOpen(true);
  }

  const completionPercent = data?.stats.totalTasks
    ? Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100)
    : 0;

  return (
    <main className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">
              Checklist hằng ngày
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal sm:text-4xl">
              Hôm nay
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-[var(--muted)]">
              <CalendarDays size={16} />
              <span>{data?.date ?? "Đang tải..."}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--panel)] px-4 text-sm font-medium"
              onClick={() => {
                mutate();
                mutateStats();
              }}
              type="button"
            >
              <RefreshCw size={17} />
              Làm mới
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white"
              onClick={() => {
                setForm(emptyForm);
                setIsFormOpen((current) => !current);
              }}
              type="button"
            >
              <Plus size={18} />
              Thêm việc
            </button>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <ProgressPanel
            label="Tổng công việc"
            value={`${data?.stats.completedTasks ?? 0}/${data?.stats.totalTasks ?? 0}`}
            detail={`${completionPercent}% đã xong toàn bộ`}
            tone="overall"
          />
          <ProgressPanel
            label="Chồng"
            value={`${data?.stats.husband.completed ?? 0}/${data?.stats.husband.total ?? 0}`}
            detail="Phần việc của chồng"
            tone="husband"
          />
          <ProgressPanel
            label="Vợ"
            value={`${data?.stats.wife.completed ?? 0}/${data?.stats.wife.total ?? 0}`}
            detail="Phần việc của vợ"
            tone="wife"
          />
        </section>

        {isFormOpen ? (
          <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
            <form className="grid gap-4" onSubmit={submitTask}>
              <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Tên công việc</span>
                  <input
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Ví dụ: đọc 1 trang sách"
                    required
                    value={form.title}
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Người làm</span>
                  <select
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        assigneeMode: event.target.value as TaskForm["assigneeMode"],
                      }))
                    }
                    value={form.assigneeMode}
                  >
                    <option value="husband">Chồng</option>
                    <option value="wife">Vợ</option>
                    <option value="both">Cả hai</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Ghi chú</span>
                <textarea
                  className="min-h-20 rounded-md border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Mục tiêu hoặc chi tiết nhỏ nếu cần"
                  value={form.note}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-[220px_220px_1fr]">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Kiểu lịch</span>
                  <select
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        scheduleType: event.target.value as ScheduleType,
                      }))
                    }
                    value={form.scheduleType}
                  >
                    <option value="daily">Hằng ngày</option>
                    <option value="one_day">Một ngày duy nhất</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Ngày</span>
                  <input
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)] disabled:bg-[#f0ede6]"
                    disabled={form.scheduleType === "daily"}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    type="date"
                    value={form.date}
                  />
                </label>

                <div className="flex items-end gap-2">
                  <button
                    className="h-11 rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white"
                    disabled={saving}
                    type="submit"
                  >
                    {form.id ? "Lưu thay đổi" : "Tạo công việc"}
                  </button>
                  <button
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium"
                    onClick={() => {
                      setForm(emptyForm);
                      setIsFormOpen(false);
                    }}
                    type="button"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </form>
          </section>
        ) : null}

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
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-base font-semibold">Danh sách công việc</h2>
            <ChevronDown size={18} className="text-[var(--muted)]" />
          </div>

          {isLoading ? (
            <StateMessage text="Đang tải checklist..." />
          ) : error ? (
            <StateMessage text="Chưa thể tải dữ liệu. Kiểm tra DATABASE_URL và migration." />
          ) : filteredTasks.length === 0 ? (
            <StateMessage text="Chưa có công việc nào cho bộ lọc này." />
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredTasks.map((task) => (
                <TaskRow
                  filter={filter}
                  key={task.id}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => editTask(task)}
                  onToggle={(member) => toggleTask(task, member)}
                  task={task}
                />
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-3 lg:grid-cols-[1fr_360px]">
          <article className="rounded-lg border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm">
            <h2 className="text-base font-semibold">Thống kê 7 ngày</h2>
            <div className="mt-4 grid grid-cols-7 items-end gap-2">
              {(stats?.lastSeven ?? []).map((day) => (
                <div className="grid gap-2" key={day.date}>
                  <div className="flex h-28 items-end rounded-md bg-[#ece7dc] p-1">
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
                    <span className="rounded-md bg-[#f4d35e] px-2 py-1 text-sm font-semibold text-[#3d2f00]">
                      {item.streak} ngày
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
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
    overall: "bg-[#176b63] text-white",
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
      className={`h-10 rounded-md border px-4 text-sm font-medium ${
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

function TaskRow({
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
    filter === "all" ? task.assignees : task.assignees.filter((member) => member === filter);

  return (
    <article className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-base font-semibold">{task.title}</h3>
          <span className="rounded-md bg-[#e6e1d6] px-2 py-1 text-xs font-medium text-[#4b453b]">
            {task.scheduleType === "daily" ? "Hằng ngày" : "Một ngày"}
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
        </div>
        {task.note ? (
          <p className="mt-1 break-words text-sm text-[var(--muted)]">{task.note}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleMembers.map((member) => (
            <button
              className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium ${
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

      <div className="flex gap-2 md:justify-end">
        <button
          aria-label="Sửa công việc"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white"
          onClick={onEdit}
          title="Sửa công việc"
          type="button"
        >
          <Pencil size={17} />
        </button>
        <button
          aria-label="Xóa công việc"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-white text-[var(--danger)]"
          onClick={onDelete}
          title="Xóa công việc"
          type="button"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

function StateMessage({ text }: { text: string }) {
  return <div className="px-4 py-10 text-center text-sm text-[var(--muted)]">{text}</div>;
}

function toAssignees(mode: TaskForm["assigneeMode"]): Member[] {
  if (mode === "both") {
    return ["husband", "wife"];
  }

  return [mode];
}
