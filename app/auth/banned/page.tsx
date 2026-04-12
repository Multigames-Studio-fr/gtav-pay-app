import { signOut } from "@/lib/auth";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-5xl">🚫</span>
      <h1 className="text-2xl font-bold text-red-400">Compte banni</h1>
      <p className="text-white/60 max-w-sm">
        Votre compte a été banni de la plateforme. Contactez un administrateur
        pour plus d&apos;informations.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="px-4 py-2 bg-white/10 rounded-lg text-white/80 hover:bg-white/20 transition-colors text-sm"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
