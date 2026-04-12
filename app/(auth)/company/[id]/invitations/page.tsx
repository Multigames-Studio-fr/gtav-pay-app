import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { InvitationsClient } from "./InvitationsClient";

export default async function InvitationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/");

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: id } },
    include: { role: true },
  });

  if (!membership) notFound();

  const perms = membership.role?.permissions ?? [];
  if (!hasPermission(perms, PERMISSIONS.MANAGE_INVITATIONS)) notFound();

  const invitations = await prisma.invitation.findMany({
    where: { companyId: id },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <InvitationsClient
      companyId={id}
      invitations={invitations as any}
      currentUserId={session.user.id}
    />
  );
}
