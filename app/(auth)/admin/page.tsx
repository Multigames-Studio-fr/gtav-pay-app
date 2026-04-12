import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import Link from "next/link";

export default async function AdminDashboard() {
  const [users, companies, companyTypes, warnings, absences] =
    await Promise.all([
      prisma.user.count(),
      prisma.company.count(),
      prisma.companyType.count(),
      prisma.warning.count(),
      prisma.absence.count({ where: { endDate: null } }),
    ]);

  const recentCompanies = await prisma.company.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { type: true, _count: { select: { members: true } } },
  });

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">
        Tableau de bord webmaster
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Utilisateurs" value={users} icon="👥" />
        <StatCard
          label="Entreprises"
          value={companies}
          icon="🏢"
          color="text-indigo-400"
        />
        <StatCard
          label="Types"
          value={companyTypes}
          icon="🏭"
          color="text-purple-400"
        />
        <StatCard
          label="Absences actives"
          value={absences}
          icon="📅"
          color="text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent companies */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Dernières entreprises
            </h2>
            <Link
              href="/admin/companies"
              className="text-indigo-400 text-xs hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentCompanies.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{c.name}</p>
                  <p className="text-white/40 text-xs">{c.type.name}</p>
                </div>
                <span className="text-white/30 text-xs shrink-0">
                  {c._count.members} employé{c._count.members !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
              Derniers utilisateurs
            </h2>
            <Link
              href="/admin/users"
              className="text-indigo-400 text-xs hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 py-1.5 border-b border-white/5 last:border-0"
              >
                <img
                  src={u.image ?? ""}
                  alt={u.name ?? ""}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{u.name}</p>
                </div>
                <span
                  className={`text-xs ${u.isWebmaster ? "text-red-400" : "text-white/30"}`}
                >
                  {u.isWebmaster ? "Webmaster" : "Utilisateur"}
                </span>
                {u.isBanned && (
                  <span className="text-red-500 text-xs">Banni</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
