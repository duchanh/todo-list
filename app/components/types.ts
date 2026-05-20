import type { Member, ScheduleType } from "@/lib/types";

export type StatsResponse = {
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

export type ManagedTask = {
  id: string;
  title: string;
  note: string | null;
  assignees: Member[];
  scheduleType: ScheduleType;
  date: string | null;
  active: boolean;
};

export type TaskForm = {
  id?: string;
  title: string;
  note: string;
  assigneeMode: "husband" | "wife" | "both";
  scheduleType: ScheduleType;
  date: string;
  active: boolean;
};
