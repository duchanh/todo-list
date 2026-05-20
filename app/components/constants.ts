import type { Member } from "@/lib/types";
import type { TaskForm } from "./types";

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const currentDate = () => new Date().toISOString().slice(0, 10);

export const emptyForm: TaskForm = {
  title: "",
  note: "",
  assigneeMode: "husband",
  scheduleType: "daily",
  date: currentDate(),
  active: true,
};

export const memberDisplay: Record<Member, string> = {
  husband: "Chồng",
  wife: "Vợ",
};
