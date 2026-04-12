"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface Warning {
  id: string;
  reason: string;
  issuedAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface Member {
  id: string;
  user: { id: string; name: string | null };
}

interface Props {
  companyId: string;
  warnings: Warning[];
  members: Member[];
}

export function WarningsClient({ companyId, warnings, members }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!userId || !reason.trim()) return;
    setLoading(true);
    await fetch(`/api/companies/${companyId}/warnings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    });
    setLoading(false);
    setUserId("");
    setReason("");
    onClose();
    router.refresh();
  };

  const handleDelete = async (warnId: string) => {
    if (!confirm("Supprimer cet avertissement ?")) return;
    await fetch(`/api/companies/${companyId}/warnings/${warnId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Avertissements ({warnings.length})
        </h1>
        <Button color="primary" onPress={onOpen}>
          + Avertir
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {warnings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/30 text-sm">Aucun avertissement</p>
          </div>
        ) : (
          warnings.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-3"
            >
              <img
                src={w.user.image ?? ""}
                alt={w.user.name ?? ""}
                className="w-9 h-9 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{w.user.name}</p>
                <p className="text-white/70 text-sm mt-0.5">{w.reason}</p>
                <p className="text-white/30 text-xs mt-1">
                  {new Date(w.issuedAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={() => handleDelete(w.id)}
              >
                Supprimer
              </Button>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Nouvel avertissement</ModalHeader>
          <ModalBody>
            <Select
              label="Employé"
              selectedKeys={userId ? [userId] : []}
              onSelectionChange={(keys) =>
                setUserId(Array.from(keys)[0] as string)
              }
            >
              {members.map((m) => (
                <SelectItem key={m.user.id}>{m.user.name ?? ""}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Motif"
              value={reason}
              onValueChange={setReason}
              minRows={3}
              placeholder="Décrivez la raison de l'avertissement..."
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="warning"
              isLoading={loading}
              onPress={handleCreate}
              isDisabled={!userId || !reason.trim()}
            >
              Émettre
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
