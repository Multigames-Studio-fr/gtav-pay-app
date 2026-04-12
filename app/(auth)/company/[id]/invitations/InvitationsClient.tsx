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
  Textarea,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string | null;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
  receiver: { id: string; name: string | null; image: string | null };
}

interface Props {
  companyId: string;
  invitations: Invitation[];
  currentUserId: string;
}

const statusColors: Record<string, "warning" | "success" | "danger"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "danger",
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  REJECTED: "Refusée",
};

export function InvitationsClient({
  companyId,
  invitations,
  currentUserId,
}: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [discordName, setDiscordName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvite = async () => {
    if (!discordName.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/companies/${companyId}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordName, message: message || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Erreur lors de l'invitation");
      return;
    }
    setDiscordName("");
    setMessage("");
    onClose();
    router.refresh();
  };

  const handleCancel = async (invId: string) => {
    await fetch(`/api/companies/${companyId}/invitations/${invId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Invitations</h1>
        <Button color="primary" onPress={onOpen}>
          + Inviter un employé
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {invitations.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/30 text-sm">Aucune invitation envoyée</p>
          </div>
        ) : (
          invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3"
            >
              <img
                src={inv.receiver.image ?? ""}
                alt={inv.receiver.name ?? ""}
                className="w-9 h-9 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium text-sm">
                    {inv.receiver.name}
                  </p>
                  <Chip
                    size="sm"
                    color={statusColors[inv.status]}
                    variant="flat"
                  >
                    {statusLabels[inv.status]}
                  </Chip>
                </div>
                {inv.message && (
                  <p className="text-white/40 text-xs italic mt-0.5">
                    &quot;{inv.message}&quot;
                  </p>
                )}
                <p className="text-white/30 text-xs">
                  Invité par {inv.sender.name} ·{" "}
                  {new Date(inv.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              {inv.status === "PENDING" && (
                <Button
                  size="sm"
                  variant="flat"
                  color="danger"
                  onPress={() => handleCancel(inv.id)}
                >
                  Annuler
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Inviter un employé</ModalHeader>
          <ModalBody>
            <Input
              label="Nom Discord (ex: utilisateur)"
              value={discordName}
              onValueChange={setDiscordName}
              placeholder="Nom d'utilisateur Discord"
            />
            <Textarea
              label="Message (optionnel)"
              value={message}
              onValueChange={setMessage}
              minRows={2}
              placeholder="Bienvenue dans notre équipe..."
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onPress={handleInvite}
              isDisabled={!discordName.trim()}
            >
              Envoyer l&apos;invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
