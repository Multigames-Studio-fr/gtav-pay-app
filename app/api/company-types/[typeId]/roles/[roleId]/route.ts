import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ typeId: string; roleId: string }> }
) {
  const { roleId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color, permissions } = await req.json();
  const role = await prisma.role.update({
    where: { id: roleId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(permissions !== undefined ? { permissions } : {}),
    },
  });
  return NextResponse.json(role);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ typeId: string; roleId: string }> }
) {
  const { roleId } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.role.delete({ where: { id: roleId } });
  return NextResponse.json({ ok: true });
}
