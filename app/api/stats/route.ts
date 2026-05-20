import { NextResponse } from "next/server";
import { ScheduleType } from "@prisma/client";
import { eachDayOfInterval, subDays } from "date-fns";

import { DATE_FORMAT, dateKeyToUtcDate, todayKey, toDateKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = dateKeyToUtcDate(todayKey());
  const lastSevenDays = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });
  const streakWindowStart = subDays(today, 59);

  const [tasks, completions] = await Promise.all([
    prisma.task.findMany({
      where: {
        active: true,
      },
      include: {
        assignees: true,
      },
    }),
    prisma.completion.findMany({
      where: {
        date: {
          gte: streakWindowStart,
          lte: today,
        },
      },
    }),
  ]);

  const completionMap = new Map(
    completions
      .filter((completion) => completion.completed)
      .map((completion) => [
        `${completion.taskId}:${toDateKey(completion.date)}:${completion.member}`,
        true,
      ]),
  );

  const lastSeven = lastSevenDays.map((date) => {
    const dateKey = toDateKey(date);
    const tasksForDay = tasks.filter(
      (task) =>
        task.scheduleType === ScheduleType.daily ||
        (task.date && toDateKey(task.date) === dateKey),
    );
    const completedTasks = tasksForDay.filter((task) =>
      task.assignees.every((assignee) =>
        completionMap.has(`${task.id}:${dateKey}:${assignee.member}`),
      ),
    ).length;

    return {
      date: dateKey,
      total: tasksForDay.length,
      completed: completedTasks,
      percent: tasksForDay.length
        ? Math.round((completedTasks / tasksForDay.length) * 100)
        : 0,
    };
  });

  const streaks = tasks
    .filter((task) => task.scheduleType === ScheduleType.daily)
    .map((task) => {
      let streak = 0;

      for (let offset = 0; offset < 60; offset += 1) {
        const date = subDays(today, offset);
        const dateKey = toDateKey(date);
        const completed = task.assignees.every((assignee) =>
          completionMap.has(`${task.id}:${dateKey}:${assignee.member}`),
        );

        if (!completed) {
          break;
        }

        streak += 1;
      }

      return {
        taskId: task.id,
        title: task.title,
        assignees: task.assignees.map((assignee) => assignee.member),
        streak,
      };
    })
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5);

  return NextResponse.json({
    format: DATE_FORMAT,
    lastSeven,
    streaks,
  });
}
