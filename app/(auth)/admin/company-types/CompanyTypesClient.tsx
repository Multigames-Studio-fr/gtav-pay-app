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
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface CompanyType {
  id: string;
  name: string;
  description: string | null;
  procedures: string | null;
  color: string;
  _count: { companies: number; roles: number };
}

interface Props {
  types: CompanyType[];
}

export function CompanyTypesClient({ types }: Props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const editModal = useDisclosure();
  const [editing, setEditing] = useState<CompanyType | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [procedures, setProcedures] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setProcedures("");
    setColor("#6366f1");
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await fetch("/api/admin/company-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, procedures, color }),
    });
    setLoading(false);
    resetForm();
    onClose();
    router.refresh();
  };

  const openEdit = (t: CompanyType) => {
    setEditing(t);
    setName(t.name);
    setDescription(t.description ?? "");
    setProcedures(t.procedures ?? "");
    setColor(t.color);
    editModal.onOpen();
  };

  const handleEdit = async () => {
    if (!editing || !name.trim()) return;
    setLoading(true);
    await fetch(`/api/admin/company-types/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, procedures, color }),
    });
    setLoading(false);
    editModal.onClose();
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce type d'entreprise ? Toutes les entreprises liées seront supprimées."))
      return;
    await fetch(`/api/admin/company-types/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const FormFields = () => (
    <div className="flex flex-col gap-3">
      <Input
        label="Nom du type"
        value={name}
        onValueChange={setName}
        placeholder="ex: Transport, Immobilier..."
      />
      <div className="flex items-center gap-2">
        <label className="text-white/60 text-sm">Couleur :</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-8 rounded cursor-pointer bg-transparent border border-white/20"
        />
      </div>
      <Textarea
        label="Description"
        value={description}
        onValueChange={setDescription}
        minRows={2}
      />
      <Textarea
        label="Procédures spécifiques"
        value={procedures}
        onValueChange={setProcedures}
        minRows={4}
        placeholder="Décrivez les procédures et règles spécifiques à ce type d'entreprise..."
      />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Types d&apos;entreprise
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Gérez les types et leurs procédures
          </p>
        </div>
        <Button color="primary" onPress={onOpen}>
          + Nouveau type
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {types.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/30 text-sm">
              Aucun type d&apos;entreprise créé
            </p>
          </div>
        ) : (
          types.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border bg-white/5 p-4"
              style={{ borderColor: t.color + "50" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: t.color }}
                  />
                  <h3 className="text-white font-semibold">{t.name}</h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="flat" onPress={() => openEdit(t)}>
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    onPress={() => handleDelete(t.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
              {t.description && (
                <p className="text-white/50 text-sm mb-2">{t.description}</p>
              )}
              <div className="flex gap-3 text-xs text-white/30">
                <span>{t._count.companies} entreprise{t._count.companies !== 1 ? "s" : ""}</span>
                <span>{t._count.roles} rôle{t._count.roles !== 1 ? "s" : ""}</span>
              </div>
              {t.procedures && (
                <details className="mt-2">
                  <summary className="text-indigo-400 text-xs cursor-pointer">
                    Voir procédures
                  </summary>
                  <p className="text-white/50 text-xs mt-1 whitespace-pre-wrap">
                    {t.procedures}
                  </p>
                </details>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>Nouveau type d&apos;entreprise</ModalHeader>
          <ModalBody>
            <FormFields />
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

      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Modifier le type</ModalHeader>
          <ModalBody>
            <FormFields />
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
