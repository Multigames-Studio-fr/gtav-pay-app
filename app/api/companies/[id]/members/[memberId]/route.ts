import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

async function getCallerPerms(userId: string, companyId: string) {
  const m = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { role: true },
  });
  return m?.role?.permissions ?? [];
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = await getCallerPerms(session.user.id, id);
  const body = await req.json();

  if (body.salary !== undefined && !hasPermission(perms, PERMISSIONS.MANAGE_SALARIES)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (body.roleId !== undefined && !hasPermission(perms, PERMISSIONS.MANAGE_EMPLOYEES)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.companyMember.update({
    where: { id: memberId },
    data: {
      ...(body.salary !== undefined ? { salary: body.salary } : {}),
      ...(body.roleId !== undefined ? { roleId: body.roleId } : {}),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { id, memberId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const perms = await getCallerPerms(session.user.id, id);
  if (!hasPermission(perms, PERMISSIONS.MANAGE_EMPLOYEES)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.companyMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
