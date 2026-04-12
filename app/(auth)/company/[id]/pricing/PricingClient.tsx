"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";

interface TruckPrice {
  id: string;
  truckType: string;
  pricePerFull: number;
  capacity: number;
  description: string | null;
}

interface SalaryConfig {
  id: string;
  taxRate: number;
  baseMultiplier: number;
  payDay: number;
}

interface Member {
  id: string;
  salary: number;
  user: { name: string | null };
}

interface Props {
  companyId: string;
  truckPrices: TruckPrice[];
  salaryConfig: SalaryConfig | null;
  members: Member[];
}

export function PricingClient({
  companyId,
  truckPrices,
  salaryConfig,
  members,
}: Props) {
  const router = useRouter();
  const truckModal = useDisclosure();
  const [truckType, setTruckType] = useState("");
  const [pricePerFull, setPricePerFull] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [description, setDescription] = useState("");
  const [truckLoading, setTruckLoading] = useState(false);

  // Salary config state
  const [taxRate, setTaxRate] = useState(
    String(((salaryConfig?.taxRate ?? 0.2) * 100).toFixed(0))
  );
  const [baseMultiplier, setBaseMultiplier] = useState(
    String(salaryConfig?.baseMultiplier ?? 1)
  );
  const [payDay, setPayDay] = useState(String(salaryConfig?.payDay ?? 1));
  const [configLoading, setConfigLoading] = useState(false);

  const handleAddTruck = async () => {
    if (!truckType || !pricePerFull) return;
    setTruckLoading(true);
    await fetch(`/api/companies/${companyId}/pricing/trucks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        truckType,
        pricePerFull: parseFloat(pricePerFull),
        capacity: parseInt(capacity),
        description: description || null,
      }),
    });
    setTruckLoading(false);
    setTruckType("");
    setPricePerFull("");
    setCapacity("1");
    setDescription("");
    truckModal.onClose();
    router.refresh();
  };

  const handleDeleteTruck = async (truckId: string) => {
    if (!confirm("Supprimer ce type de camion ?")) return;
    await fetch(`/api/companies/${companyId}/pricing/trucks/${truckId}`, {
      method: "DELETE",
    });
    router.refresh();
  };

  const handleSaveConfig = async () => {
    setConfigLoading(true);
    await fetch(`/api/companies/${companyId}/pricing/salary-config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxRate: parseFloat(taxRate) / 100,
        baseMultiplier: parseFloat(baseMultiplier),
        payDay: parseInt(payDay),
      }),
    });
    setConfigLoading(false);
    router.refresh();
  };

  const tax = parseFloat(taxRate) / 100;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Tarifs & Salaires</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Truck Prices */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">🚛 Prix des camions</h2>
            <Button size="sm" color="primary" onPress={truckModal.onOpen}>
              + Ajouter
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {truckPrices.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-4">
                Aucun type configuré
              </p>
            ) : (
              truckPrices.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{t.truckType}</p>
                    {t.description && (
                      <p className="text-white/40 text-xs">{t.description}</p>
                    )}
                    <p className="text-white/50 text-xs">Capacité: {t.capacity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-400 font-bold">
                      {t.pricePerFull.toLocaleString("fr-FR")} $
                    </p>
                    <p className="text-white/30 text-xs">plein</p>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                    onPress={() => handleDeleteTruck(t.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Salary Config */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">
            💰 Configuration des salaires
          </h2>
          <div className="flex flex-col gap-3">
            <Input
              type="number"
              label="Taux de taxe (%)"
              value={taxRate}
              onValueChange={setTaxRate}
              min="0"
              max="100"
              description="Pourcentage prélevé sur le salaire brut"
            />
            <Input
              type="number"
              label="Multiplicateur de base"
              value={baseMultiplier}
              onValueChange={setBaseMultiplier}
              step="0.1"
              description="Facteur appliqué au salaire brut"
            />
            <Input
              type="number"
              label="Jour de paie (1-28)"
              value={payDay}
              onValueChange={setPayDay}
              min="1"
              max="28"
            />
            <Button
              color="primary"
              isLoading={configLoading}
              onPress={handleSaveConfig}
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      {/* Salary simulation */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 mt-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          📊 Simulation des salaires
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/40 text-xs uppercase border-b border-white/10">
                <th className="pb-2 text-left">Employé</th>
                <th className="pb-2 text-right">Brut</th>
                <th className="pb-2 text-right">Taxe ({taxRate}%)</th>
                <th className="pb-2 text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const gross = m.salary * (parseFloat(baseMultiplier) || 1);
                const netPay = gross * (1 - tax);
                return (
                  <tr
                    key={m.id}
                    className="border-b border-white/5 last:border-0"
                  >
                    <td className="py-2 text-white">{m.user.name}</td>
                    <td className="py-2 text-right text-white/70">
                      {gross.toLocaleString("fr-FR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      $
                    </td>
                    <td className="py-2 text-right text-red-400/70">
                      -{(gross * tax).toLocaleString("fr-FR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      $
                    </td>
                    <td className="py-2 text-right text-green-400 font-bold">
                      {netPay.toLocaleString("fr-FR", {
                        maximumFractionDigits: 0,
                      })}{" "}
                      $
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Truck Modal */}
      <Modal isOpen={truckModal.isOpen} onClose={truckModal.onClose}>
        <ModalContent>
          <ModalHeader>Ajouter un type de camion</ModalHeader>
          <ModalBody>
            <Input
              label="Type de camion"
              value={truckType}
              onValueChange={setTruckType}
              placeholder="ex: Pounder, Phantom..."
            />
            <Input
              type="number"
              label="Prix plein ($)"
              value={pricePerFull}
              onValueChange={setPricePerFull}
            />
            <Input
              type="number"
              label="Capacité (caisses)"
              value={capacity}
              onValueChange={setCapacity}
              min="1"
            />
            <Input
              label="Description (optionnel)"
              value={description}
              onValueChange={setDescription}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={truckModal.onClose}>
              Annuler
            </Button>
            <Button
              color="primary"
              isLoading={truckLoading}
              onPress={handleAddTruck}
              isDisabled={!truckType || !pricePerFull}
            >
              Ajouter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
