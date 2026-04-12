import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f14] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-5xl text-indigo-400">⬡</span>
          <h1 className="text-4xl font-black text-white tracking-tight">
            GTA V Pay
          </h1>
        </div>

        <p className="text-white/60 text-lg max-w-md leading-relaxed">
          Plateforme de gestion d&apos;entreprise pour votre serveur GTA V
          Roleplay. Gérez vos employés, salaires, absences et bien plus.
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 w-full max-w-lg">
          {[
            { icon: "👥", label: "Gestion RH" },
            { icon: "💰", label: "Salaires & Taxes" },
            { icon: "🚛", label: "Prix camions" },
            { icon: "⚠️", label: "Avertissements" },
            { icon: "📅", label: "Absences" },
            { icon: "🔑", label: "Permissions" },
          ].map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70"
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <LoginButton />

        <p className="text-white/30 text-xs">
          Connexion via Discord uniquement
        </p>
      </div>
    </div>
  );
}
