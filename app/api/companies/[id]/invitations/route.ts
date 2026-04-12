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
  if (!caller || !hasPermission(caller.role?.permissions ?? [], PERMISSIONS.MANAGE_INVITATIONS))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { discordName, message } = await req.json();

  // Find user by name (Discord display name)
  const target = await prisma.user.findFirst({
    where: { name: { equals: discordName, mode: "insensitive" } },
  });

  if (!target)
    return NextResponse.json(
      { error: "Utilisateur introuvable. Il doit se connecter d'abord." },
      { status: 404 }
    );

  // Check already a member
  const existing = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: target.id, companyId: id } },
  });
  if (existing)
    return NextResponse.json(
      { error: "Cet utilisateur est déjà membre." },
      { status: 409 }
    );

  // Check pending invitation
  const pendingInv = await prisma.invitation.findFirst({
    where: { companyId: id, receiverId: target.id, status: "PENDING" },
  });
  if (pendingInv)
    return NextResponse.json(
      { error: "Une invitation est déjà en attente pour cet utilisateur." },
      { status: 409 }
    );

  const invitation = await prisma.invitation.create({
    data: {
      companyId: id,
      senderId: session.user.id,
      receiverId: target.id,
      message: message ?? null,
    },
  });

  return NextResponse.json(invitation);
}
