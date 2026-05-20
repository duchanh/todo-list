import { NextResponse } from "next/server";
import { Member } from "@prisma/client";
import { z } from "zod";

import { dateKeyToUtcDate, todayKey } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const toggleSchema = z.object({
  taskId: z.string().min(1),
  member: z.nativeEnum(Member),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(request: Request) {
  const payload = toggleSchema.parse(await request.json());
  const date = dateKeyToUtcDate(payload.date ?? todayKey());

  const existing = await prisma.completion.findUnique({
    where: {
      taskId_member_date: {
        taskId: payload.taskId,
        member: payload.member,
        date,
      },
    },
  });

  const nextCompleted = !existing?.completed;

  const completion = await prisma.completion.upsert({
    where: {
      taskId_member_date: {
        taskId: payload.taskId,
        member: payload.member,
        date,
      },
    },
    create: {
      taskId: payload.taskId,
      member: payload.member,
      date,
      completed: true,
      completedAt: new Date(),
    },
    update: {
      completed: nextCompleted,
      completedAt: nextCompleted ? new Date() : null,
    },
  });

  return NextResponse.json(completion);
}
