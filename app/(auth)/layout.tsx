import { Navbar } from "@/components/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14">{children}</main>
    </div>
  );
}
