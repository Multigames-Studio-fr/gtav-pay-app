"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Switch,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isBanned: boolean;
  isWebmaster: boolean;
  createdAt: string;
  memberships: { company: { name: string } }[];
}

interface Props {
  users: User[];
}

export function UsersAdminClient({ users }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: !currentBanned }),
    });
    setLoading(null);
    router.refresh();
  };

  const toggleWebmaster = async (userId: string, current: boolean) => {
    if (!confirm(current ? "Retirer les droits webmaster ?" : "Donner les droits webmaster ?"))
      return;
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isWebmaster: !current }),
    });
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Supprimer définitivement cet utilisateur et toutes ses données ?"))
      return;
    setLoading(userId);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-white/50 text-sm">{users.length} compte{users.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <Input
        className="mb-4"
        placeholder="Rechercher par nom ou email..."
        value={search}
        onValueChange={setSearch}
        startContent={<span className="text-white/30">🔍</span>}
      />

      <Table aria-label="Utilisateurs">
        <TableHeader>
          <TableColumn>UTILISATEUR</TableColumn>
          <TableColumn>ENTREPRISES</TableColumn>
          <TableColumn>RÔLE</TableColumn>
          <TableColumn>STATUT</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {filtered.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <img
                    src={u.image ?? ""}
                    alt={u.name ?? ""}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-white text-sm">{u.name}</p>
                    <p className="text-white/40 text-xs">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {u.memberships.slice(0, 2).map((m, i) => (
                    <span
                      key={i}
                      className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50"
                    >
                      {m.company.name}
                    </span>
                  ))}
                  {u.memberships.length > 2 && (
                    <span className="text-xs text-white/30">
                      +{u.memberships.length - 2}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {u.isWebmaster ? (
                  <Chip size="sm" color="danger" variant="flat">
                    Webmaster
                  </Chip>
                ) : (
                  <span className="text-white/40 text-xs">Utilisateur</span>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  size="sm"
                  color={u.isBanned ? "danger" : "success"}
                  variant="flat"
                >
                  {u.isBanned ? "Banni" : "Actif"}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color={u.isBanned ? "success" : "warning"}
                    variant="flat"
                    isLoading={loading === u.id}
                    onPress={() => toggleBan(u.id, u.isBanned)}
                  >
                    {u.isBanned ? "Débannir" : "Bannir"}
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    isLoading={loading === u.id}
                    onPress={() => toggleWebmaster(u.id, u.isWebmaster)}
                  >
                    {u.isWebmaster ? "Retirer WM" : "Webmaster"}
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isLoading={loading === u.id}
                    onPress={() => handleDelete(u.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
