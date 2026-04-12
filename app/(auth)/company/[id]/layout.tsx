import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/");

  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: { userId: session.user.id, companyId: id },
    },
    include: {
      company: { include: { type: true } },
      role: true,
    },
  });

  if (!membership) notFound();

  const perms = membership.role?.permissions ?? [];
  const isOwner = perms.includes(PERMISSIONS.OWNER);

  const sidebarItems = [
    { label: "Vue d'ensemble", href: `/company/${id}`, icon: "📊" },
    ...(hasPermission(perms, PERMISSIONS.VIEW_EMPLOYEES)
      ? [{ label: "Employés", href: `/company/${id}/employees`, icon: "👥" }]
      : []),
    ...(hasPermission(perms, PERMISSIONS.MANAGE_WARNINGS)
      ? [
          {
            label: "Avertissements",
            href: `/company/${id}/warnings`,
            icon: "⚠️",
          },
        ]
      : []),
    ...(hasPermission(perms, PERMISSIONS.MANAGE_ABSENCES)
      ? [{ label: "Absences", href: `/company/${id}/absences`, icon: "📅" }]
      : []),
    ...(hasPermission(perms, PERMISSIONS.MANAGE_BONUSES)
      ? [{ label: "Primes", href: `/company/${id}/bonuses`, icon: "🎁" }]
      : []),
    ...(hasPermission(perms, PERMISSIONS.MANAGE_INVITATIONS)
      ? [
          {
            label: "Invitations",
            href: `/company/${id}/invitations`,
            icon: "📬",
          },
        ]
      : []),
    ...(hasPermission(perms, PERMISSIONS.MANAGE_PRICING)
      ? [{ label: "Tarifs", href: `/company/${id}/pricing`, icon: "💰" }]
      : []),
    ...(isOwner || hasPermission(perms, PERMISSIONS.MANAGE_ROLES)
      ? [
          {
            label: "Permissions",
            href: `/company/${id}/permissions`,
            icon: "🔑",
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col">
        <div className="px-3 py-3 border-b border-white/10">
          <p className="text-white font-semibold text-sm truncate max-w-[192px]">
            {membership.company.name}
          </p>
          <p className="text-white/40 text-xs">
            {membership.company.type.name}
          </p>
        </div>
        <Sidebar items={sidebarItems} />
      </div>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
