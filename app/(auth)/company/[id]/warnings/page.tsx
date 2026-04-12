import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { WarningsClient } from "./WarningsClient";

export default async function WarningsPage({
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
  if (!hasPermission(perms, PERMISSIONS.MANAGE_WARNINGS)) notFound();

  const warnings = await prisma.warning.findMany({
    where: { companyId: id },
    include: { user: true },
    orderBy: { issuedAt: "desc" },
  });

  const members = await prisma.companyMember.findMany({
    where: { companyId: id },
    include: { user: true },
  });

  return (
    <WarningsClient
      companyId={id}
      warnings={warnings as any}
      members={members as any}
    />
  );
}
