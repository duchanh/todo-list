"use client";

import {
  createContext,
  FormEvent,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { mutate as globalMutate } from "swr";
import { X } from "lucide-react";

import type { Member } from "@/lib/types";
import { currentDate, emptyForm } from "./constants";
import type { ManagedTask, TaskForm } from "./types";

type TaskModalContextValue = {
  openCreate: (date?: string) => void;
  openEdit: (task: ManagedTask) => void;
};

const TaskModalContext = createContext<TaskModalContextValue | null>(null);

export function TaskModalProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const value = useMemo<TaskModalContextValue>(
    () => ({
      openCreate: (date) => {
        setForm({ ...emptyForm, date: date ?? currentDate() });
        setOpen(true);
      },
      openEdit: (task) => {
        setForm({
          id: task.id,
          title: task.title,
          note: task.note ?? "",
          assigneeMode:
            task.assignees.length === 2 ? "both" : task.assignees[0] ?? "husband",
          scheduleType: task.scheduleType,
          date: task.date ?? currentDate(),
          active: task.active,
        });
        setOpen(true);
      },
    }),
    [],
  );

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

    setOpen(false);
    setForm(emptyForm);
    globalMutate((key) => typeof key === "string" && key.startsWith("/api/"));
  }

  return (
    <TaskModalContext.Provider value={value}>
      {children}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4 py-6">
          <section className="w-full max-w-2xl rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
              <h2 className="text-base font-semibold">
                {form.id ? "Sửa task" : "Thêm task"}
              </h2>
              <button
                aria-label="Đóng"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted)] hover:bg-[#f3f0e9]"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
            <form className="grid gap-4 p-4" onSubmit={submitTask}>
              <label className="grid gap-1">
                <span className="text-sm font-medium">Tên task</span>
                <input
                  className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Ví dụ: đọc 1 trang sách"
                  required
                  value={form.title}
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Ghi chú</span>
                <textarea
                  className="min-h-20 rounded-md border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Mục tiêu hoặc chi tiết nhỏ nếu cần"
                  value={form.note}
                />
              </label>

              <div className="grid gap-3 md:grid-cols-3">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Người làm</span>
                  <select
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        assigneeMode: event.target.value as TaskForm["assigneeMode"],
                      })
                    }
                    value={form.assigneeMode}
                  >
                    <option value="husband">Chồng</option>
                    <option value="wife">Vợ</option>
                    <option value="both">Cả hai</option>
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Kiểu lịch</span>
                  <select
                    className="h-11 rounded-md border border-[var(--border)] bg-white px-3 outline-none focus:border-[var(--accent)]"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        scheduleType: event.target.value as TaskForm["scheduleType"],
                      })
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
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    type="date"
                    value={form.date}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  checked={form.active}
                  className="h-4 w-4 accent-[var(--accent)]"
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                  type="checkbox"
                />
                Đang bật
              </label>

              <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-4">
                <button
                  className="inline-flex h-10 items-center justify-center rounded-md border border-[var(--border)] bg-white px-4 text-sm font-medium"
                  onClick={() => setOpen(false)}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-white"
                  disabled={saving}
                  type="submit"
                >
                  {form.id ? "Lưu thay đổi" : "Thêm task"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </TaskModalContext.Provider>
  );
}

export function useTaskModal() {
  const context = useContext(TaskModalContext);

  if (!context) {
    throw new Error("useTaskModal must be used inside TaskModalProvider");
  }

  return context;
}

function toAssignees(mode: TaskForm["assigneeMode"]): Member[] {
  if (mode === "both") {
    return ["husband", "wife"];
  }

  return [mode];
}
