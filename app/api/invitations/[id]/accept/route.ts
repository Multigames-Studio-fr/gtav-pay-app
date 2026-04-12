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

  if (invitation.status !== "PENDING")
    return NextResponse.json({ error: "Already processed" }, { status: 400 });

  await prisma.$transaction([
    prisma.invitation.update({ where: { id }, data: { status: "ACCEPTED" } }),
    prisma.companyMember.create({
      data: {
        userId: session.user.id,
        companyId: invitation.companyId,
      },
    }),
  ]);

  return NextResponse.redirect(new URL("/dashboard", process.env.AUTH_URL!));
}
