import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StatCard } from "@/components/StatCard";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/");

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      type: true,
      members: { include: { user: true, role: true } },
      warnings: { include: { user: true }, orderBy: { issuedAt: "desc" }, take: 5 },
      absences: { where: { endDate: null } },
      salaryConfig: true,
      _count: { select: { members: true, warnings: true, bonuses: true } },
    },
  });

  if (!company) notFound();

  const totalSalary = company.members.reduce((s, m) => s + m.salary, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{company.name}</h1>
        <p className="text-white/50 text-sm mt-1">
          {company.type.name}
          {company.description && ` · ${company.description}`}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Employés"
          value={company._count.members}
          icon="👥"
        />
        <StatCard
          label="Masse salariale"
          value={totalSalary.toLocaleString("fr-FR") + " $"}
          icon="💵"
          color="text-green-400"
        />
        <StatCard
          label="Avertissements"
          value={company._count.warnings}
          icon="⚠️"
          color="text-yellow-400"
        />
        <StatCard
          label="Absences actives"
          value={company.absences.length}
          icon="📅"
          color="text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent members */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Équipe
          </h2>
          <div className="flex flex-col gap-2">
            {company.members.slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <img
                  src={m.user.image ?? ""}
                  alt={m.user.name ?? ""}
                  className="w-7 h-7 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{m.user.name}</p>
                </div>
                {m.role && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                    style={{
                      color: m.role.color,
                      background: m.role.color + "20",
                    }}
                  >
                    {m.role.name}
                  </span>
                )}
                <span className="text-xs text-green-400 shrink-0">
                  {m.salary.toLocaleString("fr-FR")} $
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent warnings */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-3">
            Derniers avertissements
          </h2>
          {company.warnings.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-4">
              Aucun avertissement
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {company.warnings.map((w) => (
                <div
                  key={w.id}
                  className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0"
                >
                  <img
                    src={w.user.image ?? ""}
                    alt={w.user.name ?? ""}
                    className="w-6 h-6 rounded-full mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{w.user.name}</p>
                    <p className="text-white/50 text-xs truncate">{w.reason}</p>
                  </div>
                  <span className="text-white/30 text-xs shrink-0">
                    {new Date(w.issuedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
