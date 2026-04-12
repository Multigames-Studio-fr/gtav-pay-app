import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { AbsencesClient } from "./AbsencesClient";

export default async function AbsencesPage({
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
  if (!hasPermission(perms, PERMISSIONS.MANAGE_ABSENCES)) notFound();

  const absences = await prisma.absence.findMany({
    where: { companyId: id },
    include: { user: true },
    orderBy: { startDate: "desc" },
  });

  const members = await prisma.companyMember.findMany({
    where: { companyId: id },
    include: { user: true },
  });

  return (
    <AbsencesClient
      companyId={id}
      absences={absences as any}
      members={members as any}
    />
  );
}
