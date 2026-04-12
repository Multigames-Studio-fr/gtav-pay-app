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
  Switch,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface Absence {
  id: string;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  justified: boolean;
  user: { id: string; name: string | null; image: string | null };
}

interface Member {
  id: string;
  user: { id: string; name: string | null };
}

interface Props {
  companyId: string;
  absences: Absence[];
  members: Member[];
}

export function AbsencesClient({ companyId, absences, members }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [justified, setJustified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!userId || !startDate) return;
    setLoading(true);
    await fetch(`/api/companies/${companyId}/absences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        startDate,
        endDate: endDate || null,
        reason: reason || null,
        justified,
      }),
    });
    setLoading(false);
    onClose();
    router.refresh();
  };

  const handleJustify = async (absenceId: string, val: boolean) => {
    await fetch(`/api/companies/${companyId}/absences/${absenceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ justified: val }),
    });
    router.refresh();
  };

  const handleDelete = async (absenceId: string) => {
    if (!confirm("Supprimer cette absence ?")) return;
    await fetch(`/api/companies/${companyId}/absences/${absenceId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  const active = absences.filter((a) => !a.endDate);
  const past = absences.filter((a) => a.endDate);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Absences
        </h1>
        <Button color="primary" onPress={onOpen}>
          + Nouvelle absence
        </Button>
      </div>

      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-wide mb-3">
            En cours ({active.length})
          </h2>
          <div className="flex flex-col gap-3">
            {active.map((a) => (
              <AbsenceRow
                key={a.id}
                absence={a}
                onJustify={handleJustify}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wide mb-3">
          Historique ({past.length})
        </h2>
        {past.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-6">Aucune absence passée</p>
        ) : (
          <div className="flex flex-col gap-3">
            {past.map((a) => (
              <AbsenceRow
                key={a.id}
                absence={a}
                onJustify={handleJustify}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Nouvelle absence</ModalHeader>
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
              type="date"
              label="Début"
              value={startDate}
              onValueChange={setStartDate}
            />
            <Input
              type="date"
              label="Fin (optionnel)"
              value={endDate}
              onValueChange={setEndDate}
            />
            <Textarea
              label="Motif (optionnel)"
              value={reason}
              onValueChange={setReason}
              minRows={2}
            />
            <div className="flex items-center gap-2">
              <Switch
                isSelected={justified}
                onValueChange={setJustified}
                size="sm"
              />
              <span className="text-white/70 text-sm">Justifiée</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onPress={handleCreate}
              isDisabled={!userId || !startDate}
            >
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

function AbsenceRow({
  absence,
  onJustify,
  onDelete,
}: {
  absence: {
    id: string;
    startDate: string;
    endDate: string | null;
    reason: string | null;
    justified: boolean;
    user: { id: string; name: string | null; image: string | null };
  };
  onJustify: (id: string, val: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
      <img
        src={absence.user.image ?? ""}
        alt={absence.user.name ?? ""}
        className="w-9 h-9 rounded-full shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-medium text-sm">{absence.user.name}</p>
          <Chip
            size="sm"
            color={absence.justified ? "success" : "warning"}
            variant="flat"
          >
            {absence.justified ? "Justifiée" : "Non justifiée"}
          </Chip>
        </div>
        <p className="text-white/50 text-xs mt-0.5">
          Du {new Date(absence.startDate).toLocaleDateString("fr-FR")}
          {absence.endDate
            ? ` au ${new Date(absence.endDate).toLocaleDateString("fr-FR")}`
            : " · En cours"}
        </p>
        {absence.reason && (
          <p className="text-white/40 text-xs mt-0.5 italic">{absence.reason}</p>
        )}
      </div>
      <div className="flex gap-2 shrink-0">
        <Switch
          size="sm"
          isSelected={absence.justified}
          onValueChange={(v) => onJustify(absence.id, v)}
        />
        <Button
          size="sm"
          color="danger"
          variant="flat"
          onPress={() => onDelete(absence.id)}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}
