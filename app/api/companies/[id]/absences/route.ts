import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const caller = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: id } },
    include: { role: true },
  });
  if (!caller || !hasPermission(caller.role?.permissions ?? [], PERMISSIONS.MANAGE_ABSENCES))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, startDate, endDate, reason, justified } = await req.json();
  const absence = await prisma.absence.create({
    data: {
      userId,
      companyId: id,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      reason: reason ?? null,
      justified: justified ?? false,
    },
  });
  return NextResponse.json(absence);
}
