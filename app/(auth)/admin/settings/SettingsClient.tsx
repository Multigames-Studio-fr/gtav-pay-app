"use client";

export function SettingsClient() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Paramètres</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            🗃️ Base de données
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-white text-sm font-medium">Connexion DB</p>
                <p className="text-white/40 text-xs">
                  Configuré via la variable DATABASE_URL
                </p>
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-white text-sm font-medium">Prisma ORM</p>
                <p className="text-white/40 text-xs">
                  PostgreSQL · Prisma v6
                </p>
              </div>
              <span className="text-green-400 text-xs">Actif</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            🔐 Authentification
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div>
                <p className="text-white text-sm font-medium">
                  Discord OAuth
                </p>
                <p className="text-white/40 text-xs">
                  Next-Auth v5 · Provider Discord
                </p>
              </div>
              <span className="text-green-400 text-xs">Actif</span>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm font-medium">
                Variables d&apos;environnement requises
              </p>
              <div className="mt-2 font-mono text-xs text-white/50 space-y-1">
                <p>AUTH_DISCORD_ID</p>
                <p>AUTH_DISCORD_SECRET</p>
                <p>AUTH_SECRET</p>
                <p>DATABASE_URL</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            ℹ️ Version
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            {[
              ["Next.js", "16.x"],
              ["React", "19.x"],
              ["Prisma", "6.x"],
              ["NextAuth", "5.x (beta)"],
              ["HeroUI", "3.x"],
              ["TailwindCSS", "4.x"],
            ].map(([lib, version]) => (
              <div key={lib} className="flex justify-between text-white/60">
                <span>{lib}</span>
                <span className="text-white/30">{version}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            📋 Commandes utiles
          </h2>
          <div className="flex flex-col gap-2">
            {[
              ["Migrations DB", "npx prisma migrate dev"],
              ["Générer client", "npx prisma generate"],
              ["Visualiser DB", "npx prisma studio"],
              ["Démarrer le serveur", "npm run dev"],
            ].map(([label, cmd]) => (
              <div
                key={cmd}
                className="p-2.5 rounded-lg bg-black/40 border border-white/10"
              >
                <p className="text-white/50 text-xs mb-0.5">{label}</p>
                <code className="text-indigo-300 text-xs font-mono">{cmd}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
