"use client";

import useSWR from "swr";
import { Plus, RefreshCw } from "lucide-react";

import { fetcher } from "../components/constants";
import { RowActions, StateMessage, TaskBadges } from "../components/TaskBits";
import { useTaskModal } from "../components/TaskModalContext";
import type { ManagedTask } from "../components/types";

export default function TasksPage() {
  const { openCreate, openEdit } = useTaskModal();
  const { data: tasks, mutate } = useSWR<ManagedTask[]>("/api/tasks", fetcher, {
    revalidateOnFocus: true,
  });

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    mutate();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Task</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Danh sách task gốc dùng chung cho tất cả các ngày.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={() => openCreate()}
            type="button"
          >
            <Plus size={16} />
            Thêm task
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)] shadow-sm">
        {!tasks?.length ? (
          <StateMessage text="Chưa có task nào." />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {tasks.map((task) => (
              <article
                className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto] md:items-center"
                key={task.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-base font-semibold">{task.title}</h3>
                    <TaskBadges task={task} />
                    {!task.active ? (
                      <span className="rounded-md bg-[#e5e7eb] px-2 py-1 text-xs font-medium text-[#4b5563]">
                        Đã tắt
                      </span>
                    ) : null}
                  </div>
                  {task.note ? (
                    <p className="mt-1 break-words text-sm text-[var(--muted)]">
                      {task.note}
                    </p>
                  ) : null}
                </div>
                <RowActions onDelete={() => deleteTask(task.id)} onEdit={() => openEdit(task)} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
