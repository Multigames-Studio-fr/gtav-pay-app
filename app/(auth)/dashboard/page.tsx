import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge, Button, Chip } from "@heroui/react";
import { StatCard } from "@/components/StatCard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        include: {
          company: { include: { type: true } },
          role: true,
        },
      },
      invitations: {
        where: { status: "PENDING" },
        include: {
          company: { include: { type: true } },
          sender: true,
        },
      },
    },
  });

  if (!user) redirect("/");

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src={user.image ?? ""}
          alt={user.name ?? ""}
          className="w-14 h-14 rounded-full border-2 border-indigo-500"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bonjour, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-white/50 text-sm">
            {user.memberships.length} entreprise
            {user.memberships.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Entreprises"
          value={user.memberships.length}
          icon="🏢"
        />
        <StatCard
          label="Invitations"
          value={user.invitations.length}
          icon="📬"
          color="text-yellow-400"
        />
        <StatCard
          label="Rôles actifs"
          value={user.memberships.filter((m) => m.role).length}
          icon="🎭"
          color="text-purple-400"
        />
        <StatCard
          label="Salaire total"
          value={
            user.memberships.reduce((s, m) => s + m.salary, 0).toLocaleString(
              "fr-FR"
            ) + " $"
          }
          icon="💵"
          color="text-green-400"
        />
      </div>

      {/* Pending invitations */}
      {user.invitations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <span className="text-yellow-400">📬</span>
            Invitations en attente
          </h2>
          <div className="flex flex-col gap-3">
            {user.invitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white font-medium">{inv.company.name}</p>
                  <p className="text-white/50 text-sm">
                    {inv.company.type.name} · Invité par {inv.sender.name}
                  </p>
                  {inv.message && (
                    <p className="text-white/40 text-xs mt-1 italic">
                      &quot;{inv.message}&quot;
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={`/api/invitations/${inv.id}/accept`} method="POST">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
                    >
                      Accepter
                    </button>
                  </form>
                  <form action={`/api/invitations/${inv.id}/reject`} method="POST">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-lg transition-colors"
                    >
                      Refuser
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My companies */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-indigo-400">🏢</span>
          Mes entreprises
        </h2>
        {user.memberships.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/40 text-sm">
              Vous ne faites partie d&apos;aucune entreprise pour le moment.
              <br />
              Attendez une invitation d&apos;un responsable.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.memberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/company/${membership.companyId}`}
                className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-indigo-500/30 p-4 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-indigo-400 transition-colors">
                      {membership.company.name}
                    </h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {membership.company.type.name}
                    </p>
                  </div>
                  {membership.role && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border"
                      style={{
                        color: membership.role.color,
                        borderColor: membership.role.color + "40",
                        background: membership.role.color + "15",
                      }}
                    >
                      {membership.role.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>
                    Rejoint le{" "}
                    {new Date(membership.joinedAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="text-green-400 font-medium">
                    {membership.salary.toLocaleString("fr-FR")} $ / mois
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
