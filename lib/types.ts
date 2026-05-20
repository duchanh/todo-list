export type Member = "husband" | "wife";
export type ScheduleType = "daily" | "one_day";

export type TodayTask = {
  id: string;
  title: string;
  note: string | null;
  scheduleType: ScheduleType;
  date: string | null;
  active: boolean;
  assignees: Member[];
  completions: Record<Member, boolean>;
  completedAt: Record<Member, string | null>;
  fullyCompleted: boolean;
};

export type TodayResponse = {
  date: string;
  tasks: TodayTask[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    husband: {
      total: number;
      completed: number;
    };
    wife: {
      total: number;
      completed: number;
    };
  };
};
