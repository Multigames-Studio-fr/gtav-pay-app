import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

async function checkPerm(userId: string, companyId: string) {
  const caller = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { role: true },
  });
  return hasPermission(caller?.role?.permissions ?? [], PERMISSIONS.MANAGE_ABSENCES);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; absenceId: string }> }
) {
  const { id, absenceId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await checkPerm(session.user.id, id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.absence.update({
    where: { id: absenceId },
    data: {
      ...(body.justified !== undefined ? { justified: body.justified } : {}),
      ...(body.endDate !== undefined ? { endDate: body.endDate ? new Date(body.endDate) : null } : {}),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; absenceId: string }> }
) {
  const { id, absenceId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await checkPerm(session.user.id, id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.absence.delete({ where: { id: absenceId } });
  return NextResponse.json({ ok: true });
}
