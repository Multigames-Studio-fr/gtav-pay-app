import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.isWebmaster)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.company.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
