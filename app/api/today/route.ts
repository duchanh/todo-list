import { NextResponse } from "next/server";
import { Member, ScheduleType } from "@prisma/client";

import { dateKeyToUtcDate, todayKey, toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import type { TodayResponse, TodayTask } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateKey = searchParams.get("date") ?? todayKey();
  const date = dateKeyToUtcDate(dateKey);

  const [tasks, completions] = await Promise.all([
    prisma.task.findMany({
      where: {
        active: true,
        OR: [
          { scheduleType: ScheduleType.daily },
          { scheduleType: ScheduleType.one_day, date },
        ],
      },
      include: {
        assignees: {
          orderBy: { member: "asc" },
        },
      },
      orderBy: [{ createdAt: "asc" }],
    }),
    prisma.completion.findMany({
      where: { date },
    }),
  ]);

  const completionMap = new Map(
    completions.map((completion) => [
      `${completion.taskId}:${completion.member}`,
      completion,
    ]),
  );

  const normalizedTasks: TodayTask[] = tasks.map((task) => {
    const assignees = task.assignees.map((assignee) => assignee.member);
    const perMember = {
      husband:
        completionMap.get(`${task.id}:${Member.husband}`)?.completed ?? false,
      wife: completionMap.get(`${task.id}:${Member.wife}`)?.completed ?? false,
    };
    const completedAt = {
      husband:
        completionMap.get(`${task.id}:${Member.husband}`)?.completedAt?.toISOString() ??
        null,
      wife:
        completionMap.get(`${task.id}:${Member.wife}`)?.completedAt?.toISOString() ??
        null,
    };

    return {
      id: task.id,
      title: task.title,
      note: task.note,
      scheduleType: task.scheduleType,
      date: task.date ? toDateKey(task.date) : null,
      active: task.active,
      assignees,
      completions: perMember,
      completedAt,
      fullyCompleted: assignees.every((member) => perMember[member]),
    };
  });

  const response: TodayResponse = {
    date: dateKey,
    tasks: normalizedTasks,
    stats: {
      totalTasks: normalizedTasks.length,
      completedTasks: normalizedTasks.filter((task) => task.fullyCompleted)
        .length,
      husband: memberStats(normalizedTasks, Member.husband),
      wife: memberStats(normalizedTasks, Member.wife),
    },
  };

  return NextResponse.json(response);
}

function memberStats(tasks: TodayTask[], member: Member) {
  const assigned = tasks.filter((task) => task.assignees.includes(member));

  return {
    total: assigned.length,
    completed: assigned.filter((task) => task.completions[member]).length,
  };
}
