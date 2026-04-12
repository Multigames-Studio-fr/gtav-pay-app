import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { PricingClient } from "./PricingClient";

export default async function PricingPage({
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
  if (!hasPermission(perms, PERMISSIONS.MANAGE_PRICING)) notFound();

  const [truckPrices, salaryConfig, members] = await Promise.all([
    prisma.truckPrice.findMany({ where: { companyId: id } }),
    prisma.salaryConfig.findUnique({ where: { companyId: id } }),
    prisma.companyMember.findMany({
      where: { companyId: id },
      include: { user: true },
      select: { id: true, salary: true, user: { select: { name: true } } },
    }),
  ]);

  return (
    <PricingClient
      companyId={id}
      truckPrices={truckPrices}
      salaryConfig={salaryConfig}
      members={members as any}
    />
  );
}
