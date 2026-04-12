import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

const adminItems = [
  { label: "Tableau de bord", href: "/admin", icon: "📊" },
  { label: "Types d'entreprise", href: "/admin/company-types", icon: "🏭" },
  { label: "Entreprises", href: "/admin/companies", icon: "🏢" },
  { label: "Utilisateurs", href: "/admin/users", icon: "👥" },
  { label: "Paramètres", href: "/admin/settings", icon: "⚙️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.isWebmaster) redirect("/dashboard");

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col">
        <div className="px-3 py-3 border-b border-white/10">
          <p className="text-white font-semibold text-sm">Administration</p>
          <p className="text-red-400 text-xs">Accès webmaster</p>
        </div>
        <Sidebar items={adminItems} />
      </div>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
