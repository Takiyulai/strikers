"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Download,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  createSpecialContribution,
  deleteSpecialContribution,
  recordSpecialPayment,
  removeSpecialPayment,
  updateSpecialContribution,
} from "@/lib/actions/finances";
import { cn } from "@/lib/cn";
import {
  SPECIAL_AMOUNTS,
  SPECIAL_CONTRIBUTION_STATUS_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatFcfa } from "@/lib/format";
import { downloadNodeAsPng, openNodePngInNewTab } from "@/lib/png";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { SpecialReportCard } from "@/components/finance/SpecialReportCard";

import type { SpecialContributionStatus } from "@/types/database";
import type { SpecialContributionWithStats } from "@/types";

interface RosterRow {
  playerId: string;
  fullName: string;
  jerseyNumber: number | null;
}

interface Props {
  contributions: SpecialContributionWithStats[];
  roster: RosterRow[];
  canManage: boolean;
  canRecord: boolean;
}

const emptyForm = { title: "", motif: "", amount: "1000", dueDate: "" };

export function SpecialContributionsManager({
  contributions,
  roster,
  canManage,
  canRecord,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [items, setItems] = useState(contributions);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(
    contributions.length === 0 && canManage,
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(contributions);
  }, [contributions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      item.contribution.title.toLowerCase().includes(q),
    );
  }, [items, query]);

  const expandedItem =
    items.find((item) => item.contribution.id === expandedId) ?? null;

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function togglePayment(
    contributionId: string,
    amount: number,
    playerId: string,
  ) {
    if (!canRecord) return;
    setError(null);
    const item = items.find(
      (candidate) => candidate.contribution.id === contributionId,
    );
    if (!item) return;
    // Le sens du toggle est calculé AVANT la mise à jour optimiste : les
    // updaters React ne s'exécutent qu'au rendu, trop tard pour l'action
    // serveur — sinon on supprime au lieu d'enregistrer.
    const next = !item.paidPlayerIds.includes(playerId);
    setItems((prev) =>
      prev.map((candidate) => {
        if (candidate.contribution.id !== contributionId) return candidate;
        return {
          ...candidate,
          paidPlayerIds: next
            ? [...candidate.paidPlayerIds, playerId]
            : candidate.paidPlayerIds.filter((id) => id !== playerId),
          paidCount: next ? candidate.paidCount + 1 : candidate.paidCount - 1,
          collected: next
            ? candidate.collected + amount
            : candidate.collected - amount,
        };
      }),
    );
    startTransition(async () => {
      const result = next
        ? await recordSpecialPayment(contributionId, playerId, amount)
        : await removeSpecialPayment(contributionId, playerId);
      if (!result.ok) {
        setError(result.error);
        router.refresh();
      } else {
        // Rafraîchit pour afficher le membre du staff ayant enregistré.
        router.refresh();
      }
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const result = await createSpecialContribution({
      title: form.title,
      motif: form.motif,
      amount: Number(form.amount),
      dueDate: form.dueDate || undefined,
    });
    setSaving(false);
    if (result.ok) {
      setForm(emptyForm);
      setShowCreate(false);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  function startEdit(contributionId: string) {
    const item = items.find(
      (candidate) => candidate.contribution.id === contributionId,
    );
    if (!item) return;
    setForm({
      title: item.contribution.title,
      motif: item.contribution.motif ?? "",
      amount: String(item.contribution.amount),
      dueDate: item.contribution.due_date ?? "",
    });
    setEditingId(contributionId);
    setExpandedId(contributionId);
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError(null);
    const result = await updateSpecialContribution({
      id: editingId,
      title: form.title,
      motif: form.motif,
      amount: Number(form.amount),
      dueDate: form.dueDate || undefined,
    });
    setSaving(false);
    if (result.ok) {
      setEditingId(null);
      setForm(emptyForm);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function toggleStatus(
    contributionId: string,
    status: SpecialContributionStatus,
  ) {
    setError(null);
    const item = items.find(
      (candidate) => candidate.contribution.id === contributionId,
    );
    if (!item) return;
    const next: SpecialContributionStatus =
      status === "ACTIVE" ? "CLOTUREE" : "ACTIVE";
    setItems((prev) =>
      prev.map((candidate) =>
        candidate.contribution.id === contributionId
          ? {
              ...candidate,
              contribution: { ...candidate.contribution, status: next },
            }
          : candidate,
      ),
    );
    const result = await updateSpecialContribution({
      id: contributionId,
      title: item.contribution.title,
      motif: item.contribution.motif ?? undefined,
      amount: item.contribution.amount,
      dueDate: item.contribution.due_date ?? undefined,
      status: next,
    });
    if (!result.ok) {
      setError(result.error);
      router.refresh();
    }
  }

  async function handleDelete(contributionId: string, title: string) {
    if (!window.confirm(`Supprimer la cotisation « ${title} » et ses paiements ?`))
      return;
    setError(null);
    const result = await deleteSpecialContribution(contributionId);
    if (result.ok) {
      if (expandedId === contributionId) setExpandedId(null);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function handleDownloadRecap() {
    if (!cardRef.current || !expandedItem) return;
    setDownloading(true);
    try {
      await downloadNodeAsPng(
        cardRef.current,
        `cotisation-speciale-${expandedItem.contribution.title}`,
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handlePreviewRecap() {
    if (!cardRef.current) return;
    setPreviewing(true);
    try {
      await openNodePngInNewTab(cardRef.current);
    } finally {
      setPreviewing(false);
    }
  }

  const expandedPaidNames = expandedItem
    ? roster
        .filter((row) => expandedItem.paidPlayerIds.includes(row.playerId))
        .map((row) => row.fullName)
    : [];
  const expandedUnpaidNames = expandedItem
    ? roster
        .filter((row) => !expandedItem.paidPlayerIds.includes(row.playerId))
        .map((row) => row.fullName)
    : [];

  const formFields = (
    <form
      onSubmit={editingId ? handleUpdate : handleCreate}
      className="space-y-3 rounded-xl bg-slate-50 p-4"
    >
      <Input
        label="Titre"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Ex : Achat de nouveaux maillots"
        required
      />
      <Input
        label="Motif"
        value={form.motif}
        onChange={(e) => setForm({ ...form, motif: e.target.value })}
        placeholder="Pourquoi cette cotisation est-elle lancée ?"
      />
      <div>
        <p className="label">Montant par membre (FCFA)</p>
        <div className="flex flex-wrap items-center gap-2">
          {SPECIAL_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setForm({ ...form, amount: String(preset) })}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold",
                form.amount === String(preset)
                  ? "border-club-sky-500 bg-club-sky-50 text-club-sky-700"
                  : "border-slate-200 bg-white text-slate-500",
              )}
            >
              {preset}
            </button>
          ))}
          <Input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-32"
            placeholder="Autre"
          />
        </div>
      </div>
      <Input
        label="Échéance (optionnel)"
        type="date"
        value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
      />

      {error ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        {editingId ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            Annuler
          </Button>
        ) : null}
        <Button type="submit" loading={saving}>
          {editingId ? "Enregistrer les modifications" : "Lancer la cotisation"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      {error && !showCreate ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {canManage && !showCreate ? (
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle cotisation
        </Button>
      ) : null}

      {canManage && showCreate ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="section-title mb-4">
            Lancer une cotisation exceptionnelle
          </h3>
          {formFields}
        </section>
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une cotisation…"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune cotisation exceptionnelle"
          description={
            canManage
              ? "Lancez la première cotisation pour financer un besoin de l'équipe."
              : "Les cotisations lancées par la direction apparaîtront ici."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const contribution = item.contribution;
            const isExpanded = expandedId === contribution.id;
            const statusTone =
              contribution.status === "ACTIVE"
                ? "green"
                : contribution.status === "EXPIREE"
                  ? "amber"
                  : "neutral";

            return (
              <section
                key={contribution.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-card"
              >
                <header
                  className="cursor-pointer p-5"
                  onClick={() => toggleExpand(contribution.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-club-navy-900">
                          {contribution.title}
                        </h3>
                        <Badge tone={statusTone}>
                          {SPECIAL_CONTRIBUTION_STATUS_LABELS[
                            contribution.status
                          ]}
                        </Badge>
                      </div>
                      {contribution.motif ? (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {contribution.motif}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500">
                        {formatFcfa(contribution.amount)} par membre
                        {contribution.due_date
                          ? ` · échéance ${formatDate(contribution.due_date)}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-club-green-600">
                        {formatFcfa(item.paidCount * contribution.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        sur {formatFcfa(item.expectedCount * contribution.amount)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {item.paidCount}/{item.expectedCount} payeurs
                      </p>
                      <ChevronDown
                        className={cn(
                          "ml-auto mt-1 h-5 w-5 text-slate-400 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </div>
                  </div>
                </header>

                {isExpanded ? (
                  <div className="space-y-4 border-t border-slate-100 p-5">
                    {canManage ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(contribution.id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleStatus(contribution.id, contribution.status)
                          }
                        >
                          {contribution.status === "ACTIVE"
                            ? "Clôturer"
                            : "Rouvrir"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() =>
                            handleDelete(contribution.id, contribution.title)
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleDownloadRecap}
                          loading={downloading}
                        >
                          <Download className="h-3.5 w-3.5" />
                          Récap PNG
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handlePreviewRecap}
                          loading={previewing}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Aperçu
                        </Button>
                      </div>
                    ) : null}

                    {editingId === contribution.id && canManage
                      ? formFields
                      : null}

                    <div>
                      <p className="mb-2 text-sm font-semibold text-club-navy-800">
                        Paiements par membre
                        {canRecord ? "" : " (consultation)"}
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {roster.map((row) => {
                          const hasPaid = item.paidPlayerIds.includes(
                            row.playerId,
                          );
                          const paymentInfo = item.payments.find(
                            (payment) => payment.playerId === row.playerId,
                          );
                          return (
                            <button
                              key={row.playerId}
                              type="button"
                              disabled={!canRecord}
                              onClick={() =>
                                togglePayment(
                                  contribution.id,
                                  contribution.amount,
                                  row.playerId,
                                )
                              }
                              className={cn(
                                "flex items-start justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                                hasPaid
                                  ? "border-club-green-200 bg-club-green-50"
                                  : "border-slate-200 bg-white hover:bg-slate-50",
                                !canRecord && "cursor-default",
                              )}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-club-navy-900">
                                  {row.jerseyNumber
                                    ? `${row.jerseyNumber}. `
                                    : ""}
                                  {row.fullName}
                                </span>
                                {hasPaid ? (
                                  <span className="block text-[11px] text-club-green-600">
                                    Par{" "}
                                    {paymentInfo?.recordedByName ??
                                      "un membre du staff"}{" "}
                                    ·{" "}
                                    {formatDateTime(paymentInfo?.paidAt ?? "")}
                                  </span>
                                ) : null}
                              </span>
                              <Badge tone={hasPaid ? "green" : "neutral"}>
                                {hasPaid ? "Payé" : "Non payé"}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      {expandedItem ? (
        <div className="pointer-events-none fixed -left-[9999px] top-0">
          <SpecialReportCard
            ref={cardRef}
            title={expandedItem.contribution.title}
            motif={expandedItem.contribution.motif}
            amount={expandedItem.contribution.amount}
            dueDate={expandedItem.contribution.due_date}
            collected={expandedItem.paidCount * expandedItem.contribution.amount}
            expectedTotal={expandedItem.expectedCount * expandedItem.contribution.amount}
            paidNames={expandedPaidNames}
            unpaidNames={expandedUnpaidNames}
          />
        </div>
      ) : null}
    </div>
  );
}