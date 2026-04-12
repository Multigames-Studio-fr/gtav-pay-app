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
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  description: string | null;
  typeId: string;
  createdAt: string;
  type: { id: string; name: string; color: string };
  _count: { members: number };
}

interface CompanyType {
  id: string;
  name: string;
  color: string;
}

interface Props {
  companies: Company[];
  companyTypes: CompanyType[];
}

export function CompaniesAdminClient({ companies, companyTypes }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !typeId) return;
    setLoading(true);
    await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, typeId }),
    });
    setLoading(false);
    setName("");
    setDescription("");
    setTypeId("");
    onClose();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entreprise et toutes ses données ?")) return;
    await fetch(`/api/admin/companies/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Entreprises</h1>
          <p className="text-white/50 text-sm">{companies.length} entreprise{companies.length !== 1 ? "s" : ""}</p>
        </div>
        <Button color="primary" onPress={onOpen} isDisabled={companyTypes.length === 0}>
          + Créer une entreprise
        </Button>
      </div>

      {companyTypes.length === 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-4 text-sm text-yellow-400">
          Vous devez d&apos;abord créer un{" "}
          <Link href="/admin/company-types" className="underline">
            type d&apos;entreprise
          </Link>{" "}
          avant de pouvoir créer une entreprise.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {companies.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/30 text-sm">Aucune entreprise</p>
          </div>
        ) : (
          companies.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-white font-semibold">{c.name}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      color: c.type.color,
                      background: c.type.color + "20",
                    }}
                  >
                    {c.type.name}
                  </span>
                </div>
                {c.description && (
                  <p className="text-white/40 text-sm truncate">{c.description}</p>
                )}
                <p className="text-white/30 text-xs mt-1">
                  {c._count.members} employé{c._count.members !== 1 ? "s" : ""} ·{" "}
                  Créée le {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => handleDelete(c.id)}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Créer une entreprise</ModalHeader>
          <ModalBody>
            <Input
              label="Nom de l'entreprise"
              value={name}
              onValueChange={setName}
            />
            <Select
              label="Type d'entreprise"
              selectedKeys={typeId ? [typeId] : []}
              onSelectionChange={(keys) =>
                setTypeId(Array.from(keys)[0] as string)
              }
            >
              {companyTypes.map((t) => (
                <SelectItem key={t.id}>{t.name}</SelectItem>
              ))}
            </Select>
            <Textarea
              label="Description (optionnel)"
              value={description}
              onValueChange={setDescription}
              minRows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              isLoading={loading}
              onPress={handleCreate}
              isDisabled={!name.trim() || !typeId}
            >
              Créer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
