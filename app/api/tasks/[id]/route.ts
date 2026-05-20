import { NextResponse } from "next/server";
import { Member, ScheduleType } from "@prisma/client";
import { z } from "zod";

import { dateKeyToUtcDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(120),
  note: z.string().trim().max(500).optional().nullable(),
  assignees: z.array(z.nativeEnum(Member)).min(1).max(2),
  scheduleType: z.nativeEnum(ScheduleType),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  active: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const payload = updateTaskSchema.parse(await request.json());
  const uniqueAssignees = Array.from(new Set(payload.assignees));

  const task = await prisma.$transaction(async (tx) => {
    await tx.taskAssignee.deleteMany({
      where: { taskId: id },
    });

    return tx.task.update({
      where: { id },
      data: {
        title: payload.title,
        note: payload.note || null,
        scheduleType: payload.scheduleType,
        date:
          payload.scheduleType === ScheduleType.one_day && payload.date
            ? dateKeyToUtcDate(payload.date)
            : null,
        active: payload.active ?? true,
        assignees: {
          create: uniqueAssignees.map((member) => ({ member })),
        },
      },
      include: {
        assignees: true,
      },
    });
  });

  return NextResponse.json(task);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.task.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
