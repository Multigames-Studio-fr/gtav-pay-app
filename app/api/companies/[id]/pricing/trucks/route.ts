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
  if (!caller || !hasPermission(caller.role?.permissions ?? [], PERMISSIONS.MANAGE_PRICING))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { truckType, pricePerFull, capacity, description } = await req.json();
  const truck = await prisma.truckPrice.create({
    data: { companyId: id, truckType, pricePerFull, capacity: capacity ?? 1, description },
  });
  return NextResponse.json(truck);
}
