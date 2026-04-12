"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Checkbox,
  CheckboxGroup,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";

interface Role {
  id: string;
  name: string;
  color: string;
  permissions: string[];
  _count: { members: number };
}

interface Props {
  companyId: string;
  companyTypeId: string;
  roles: Role[];
}

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export function PermissionsClient({ companyId, companyTypeId, roles }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const editModal = useDisclosure();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await fetch(`/api/company-types/${companyTypeId}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, permissions: selectedPerms }),
    });
    setLoading(false);
    setName("");
    setColor("#6366f1");
    setSelectedPerms([]);
    onClose();
    router.refresh();
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setName(role.name);
    setColor(role.color);
    setSelectedPerms(role.permissions);
    editModal.onOpen();
  };

  const handleEdit = async () => {
    if (!editingRole || !name.trim()) return;
    setLoading(true);
    await fetch(`/api/company-types/${companyTypeId}/roles/${editingRole.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, permissions: selectedPerms }),
    });
    setLoading(false);
    editModal.onClose();
    router.refresh();
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Supprimer ce rôle ?")) return;
    await fetch(`/api/company-types/${companyTypeId}/roles/${roleId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  const RoleForm = () => (
    <div className="flex flex-col gap-3">
      <Input
        label="Nom du rôle"
        value={name}
        onValueChange={setName}
        placeholder="ex: Responsable, Employé..."
      />
      <div className="flex items-center gap-2">
        <label className="text-white/60 text-sm">Couleur :</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer bg-transparent border border-white/20"
        />
        <span className="text-white/40 text-sm font-mono">{color}</span>
      </div>
      <div>
        <p className="text-white/60 text-sm mb-2">Permissions :</p>
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
          {ALL_PERMISSIONS.map((perm) => (
            <label
              key={perm}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPerms.includes(perm)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPerms([...selectedPerms, perm]);
                  } else {
                    setSelectedPerms(selectedPerms.filter((p) => p !== perm));
                  }
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-white/80 text-sm">
                {PERMISSION_LABELS[perm as keyof typeof PERMISSION_LABELS]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Rôles & Permissions
        </h1>
        <Button color="primary" onPress={onOpen}>
          + Nouveau rôle
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {roles.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/30 text-sm">
              Aucun rôle défini pour ce type d&apos;entreprise
            </p>
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border bg-white/5 p-4"
              style={{ borderColor: role.color + "40" }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: role.color }}
                  />
                  <h3 className="text-white font-semibold">{role.name}</h3>
                  <span className="text-white/30 text-xs">
                    {role._count.members} membre
                    {role._count.members !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="flat" onPress={() => openEdit(role)}>
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleDelete(role.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/60"
                  >
                    {PERMISSION_LABELS[perm as keyof typeof PERMISSION_LABELS] ??
                      perm}
                  </span>
                ))}
                {role.permissions.length === 0 && (
                  <span className="text-white/20 text-xs">
                    Aucune permission
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create modal */}
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Nouveau rôle</ModalHeader>
          <ModalBody>
            <RoleForm />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onPress={handleCreate}
              isDisabled={!name.trim()}
            >
              Créer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Modifier le rôle</ModalHeader>
          <ModalBody>
            <RoleForm />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={editModal.onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onPress={handleEdit}
              isDisabled={!name.trim()}
            >
              Sauvegarder
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
