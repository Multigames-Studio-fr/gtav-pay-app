import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ typeId: string }> }
) {
  const { typeId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color, permissions } = await req.json();
  const role = await prisma.role.create({
    data: { name, color: color ?? "#6366f1", companyTypeId: typeId, permissions: permissions ?? [] },
  });
  return NextResponse.json(role);
}
