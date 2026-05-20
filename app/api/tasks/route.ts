import { NextResponse } from "next/server";
import { Member, ScheduleType } from "@prisma/client";
import { z } from "zod";

import { dateKeyToUtcDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const taskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  note: z.string().trim().max(500).optional().nullable(),
  assignees: z.array(z.nativeEnum(Member)).min(1).max(2),
  scheduleType: z.nativeEnum(ScheduleType),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function POST(request: Request) {
  const payload = taskSchema.parse(await request.json());
  const uniqueAssignees = Array.from(new Set(payload.assignees));

  const task = await prisma.task.create({
    data: {
      title: payload.title,
      note: payload.note || null,
      scheduleType: payload.scheduleType,
      date:
        payload.scheduleType === ScheduleType.one_day && payload.date
          ? dateKeyToUtcDate(payload.date)
          : null,
      assignees: {
        create: uniqueAssignees.map((member) => ({ member })),
      },
    },
    include: {
      assignees: true,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
