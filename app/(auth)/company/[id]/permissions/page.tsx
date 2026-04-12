import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { PermissionsClient } from "./PermissionsClient";

export default async function PermissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/");

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId: id } },
    include: { role: true, company: { include: { type: true } } },
  });

  if (!membership) notFound();

  const perms = membership.role?.permissions ?? [];
  if (
    !hasPermission(perms, PERMISSIONS.MANAGE_ROLES) &&
    !perms.includes(PERMISSIONS.OWNER)
  )
    notFound();

  const roles = await prisma.role.findMany({
    where: { companyTypeId: membership.company.typeId },
    include: { _count: { select: { members: true } } },
  });

  return (
    <PermissionsClient
      companyId={id}
      companyTypeId={membership.company.typeId}
      roles={roles as any}
    />
  );
}
