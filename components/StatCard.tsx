interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export function StatCard({ label, value, icon, color = "text-indigo-400" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
      <div className={`text-3xl ${color}`}>{icon}</div>
      <div>
        <p className="text-white/50 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
