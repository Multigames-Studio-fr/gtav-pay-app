import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function checkWebmaster() {
  const session = await auth();
  return session?.user?.isWebmaster ? session : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await checkWebmaster()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.isBanned !== undefined ? { isBanned: body.isBanned } : {}),
      ...(body.isWebmaster !== undefined ? { isWebmaster: body.isWebmaster } : {}),
    },
  });
  return NextResponse.json(user);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await checkWebmaster()))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
