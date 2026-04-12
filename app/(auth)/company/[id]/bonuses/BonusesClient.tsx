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
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface Bonus {
  id: string;
  amount: number;
  reason: string | null;
  awardedAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface Member {
  id: string;
  user: { id: string; name: string | null };
}

interface Props {
  companyId: string;
  bonuses: Bonus[];
  members: Member[];
}

export function BonusesClient({ companyId, bonuses, members }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!userId || !amount) return;
    setLoading(true);
    await fetch(`/api/companies/${companyId}/bonuses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount: parseFloat(amount),
        reason: reason || null,
      }),
    });
    setLoading(false);
    setUserId("");
    setAmount("");
    setReason("");
    onClose();
    router.refresh();
  };

  const handleDelete = async (bonusId: string) => {
    if (!confirm("Supprimer cette prime ?")) return;
    await fetch(`/api/companies/${companyId}/bonuses/${bonusId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  const totalBonuses = bonuses.reduce((s, b) => s + b.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Primes</h1>
          <p className="text-white/50 text-sm">
            Total distribué :{" "}
            <span className="text-green-400 font-medium">
              {totalBonuses.toLocaleString("fr-FR")} $
            </span>
          </p>
        </div>
        <Button color="primary" onPress={onOpen}>
          + Attribuer une prime
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {bonuses.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/30 text-sm">Aucune prime enregistrée</p>
          </div>
        ) : (
          bonuses.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-3"
            >
              <img
                src={b.user.image ?? ""}
                alt={b.user.name ?? ""}
                className="w-9 h-9 rounded-full shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{b.user.name}</p>
                {b.reason && (
                  <p className="text-white/50 text-xs mt-0.5 truncate">
                    {b.reason}
                  </p>
                )}
                <p className="text-white/30 text-xs">
                  {new Date(b.awardedAt).toLocaleString("fr-FR")}
                </p>
              </div>
              <span className="text-green-400 font-bold text-lg shrink-0">
                +{b.amount.toLocaleString("fr-FR")} $
              </span>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={() => handleDelete(b.id)}
              >
                ✕
              </Button>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Attribuer une prime</ModalHeader>
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
            <Input
              type="number"
              label="Montant ($)"
              value={amount}
              onValueChange={setAmount}
              min="0"
            />
            <Textarea
              label="Motif (optionnel)"
              value={reason}
              onValueChange={setReason}
              minRows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="success"
              isLoading={loading}
              onPress={handleCreate}
              isDisabled={!userId || !amount}
            >
              Attribuer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
