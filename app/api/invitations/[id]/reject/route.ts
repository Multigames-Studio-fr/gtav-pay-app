import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation || invitation.receiverId !== session.user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.invitation.update({ where: { id }, data: { status: "REJECTED" } });

  return NextResponse.redirect(new URL("/dashboard", process.env.AUTH_URL!));
}
