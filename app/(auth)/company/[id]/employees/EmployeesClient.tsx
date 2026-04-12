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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  salary: number;
  joinedAt: string;
  user: { id: string; name: string | null; image: string | null };
  role: { id: string; name: string; color: string } | null;
}

interface Role {
  id: string;
  name: string;
  color: string;
}

interface Props {
  companyId: string;
  members: Member[];
  roles: Role[];
  canManage: boolean;
  canManageSalary: boolean;
  taxRate: number;
}

export function EmployeesClient({
  companyId,
  members,
  roles,
  canManage,
  canManageSalary,
  taxRate,
}: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = useState<Member | null>(null);
  const [salary, setSalary] = useState("");
  const [roleId, setRoleId] = useState("");
  const [loading, setLoading] = useState(false);

  const netSalary = (gross: number) => gross * (1 - taxRate);

  const openEdit = (m: Member) => {
    setSelected(m);
    setSalary(String(m.salary));
    setRoleId(m.role?.id ?? "");
    onOpen();
  };

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    await fetch(`/api/companies/${companyId}/members/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salary: parseFloat(salary),
        roleId: roleId || null,
      }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  };

  const handleFire = async (memberId: string) => {
    if (!confirm("Confirmer le licenciement ?")) return;
    await fetch(`/api/companies/${companyId}/members/${memberId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Employés ({members.length})
        </h1>
      </div>

      <Table aria-label="Employés" className="bg-transparent">
        <TableHeader>
          <TableColumn>EMPLOYÉ</TableColumn>
          <TableColumn>RÔLE</TableColumn>
          <TableColumn>SALAIRE BRUT</TableColumn>
          <TableColumn>SALAIRE NET</TableColumn>
          <TableColumn>DEPUIS</TableColumn>
          {(canManage || canManageSalary) ? <TableColumn>ACTIONS</TableColumn> : <TableColumn>{""}</TableColumn>}
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <img
                    src={m.user.image ?? ""}
                    alt={m.user.name ?? ""}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white text-sm">{m.user.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {m.role ? (
                  <Chip
                    size="sm"
                    style={{
                      color: m.role.color,
                      borderColor: m.role.color + "60",
                      background: m.role.color + "20",
                    }}
                    variant="bordered"
                  >
                    {m.role.name}
                  </Chip>
                ) : (
                  <span className="text-white/30 text-xs">Aucun</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-white text-sm">
                  {m.salary.toLocaleString("fr-FR")} $
                </span>
              </TableCell>
              <TableCell>
                <span className="text-green-400 text-sm font-medium">
                  {netSalary(m.salary).toLocaleString("fr-FR", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  $
                </span>
              </TableCell>
              <TableCell>
                <span className="text-white/40 text-xs">
                  {new Date(m.joinedAt).toLocaleDateString("fr-FR")}
                </span>
              </TableCell>
              <TableCell>
                {(canManage || canManageSalary) && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => openEdit(m)}
                    >
                      Modifier
                    </Button>
                    {canManage && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleFire(m.id)}
                      >
                        Licencier
                      </Button>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Modifier l&apos;employé</ModalHeader>
          <ModalBody>
            <p className="text-white/60 text-sm mb-2">
              {selected?.user.name}
            </p>
            {canManageSalary && (
              <Input
                label="Salaire brut ($)"
                type="number"
                value={salary}
                onValueChange={setSalary}
              />
            )}
            {canManage && (
              <Select
                label="Rôle"
                selectedKeys={roleId ? [roleId] : []}
                onSelectionChange={(keys) =>
                  setRoleId(Array.from(keys)[0] as string)
                }
              >
                {roles.map((r) => (
                  <SelectItem key={r.id}>{r.name}</SelectItem>
                ))}
              </Select>
            )}
            {canManageSalary && salary && (
              <p className="text-green-400 text-sm">
                Net :{" "}
                {netSalary(parseFloat(salary) || 0).toLocaleString("fr-FR", {
                  maximumFractionDigits: 0,
                })}{" "}
                $ (taxe {(taxRate * 100).toFixed(0)}%)
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button color="primary" isLoading={loading} onPress={handleSave}>
              Sauvegarder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
