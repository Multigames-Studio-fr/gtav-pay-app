import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

export async function PUT(
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
  if (!caller || !hasPermission(caller.role?.permissions ?? [], PERMISSIONS.MANAGE_PRICING))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { taxRate, baseMultiplier, payDay } = await req.json();
  const config = await prisma.salaryConfig.upsert({
    where: { companyId: id },
    create: { companyId: id, taxRate, baseMultiplier, payDay },
    update: { taxRate, baseMultiplier, payDay },
  });
  return NextResponse.json(config);
}
