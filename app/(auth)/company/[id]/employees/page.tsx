import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { EmployeesClient } from "./EmployeesClient";

export default async function EmployeesPage({
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
  if (!hasPermission(perms, PERMISSIONS.VIEW_EMPLOYEES)) notFound();

  const canManage = hasPermission(perms, PERMISSIONS.MANAGE_EMPLOYEES);
  const canManageSalary = hasPermission(perms, PERMISSIONS.MANAGE_SALARIES);

  const members = await prisma.companyMember.findMany({
    where: { companyId: id },
    include: {
      user: true,
      role: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  const roles = await prisma.role.findMany({
    where: { companyType: { companies: { some: { id } } } },
  });

  const salaryConfig = await prisma.salaryConfig.findUnique({
    where: { companyId: id },
  });

  return (
    <EmployeesClient
      companyId={id}
      members={members as any}
      roles={roles}
      canManage={canManage}
      canManageSalary={canManageSalary}
      taxRate={salaryConfig?.taxRate ?? 0.2}
    />
  );
}
