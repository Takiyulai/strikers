import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { hasPermission } from "@/lib/permissions";
import { fetchPlayers } from "@/lib/supabase/queries";
import { formatDate } from "@/lib/dates";
import { getNextTraining, WEEKLY_TRAINING_SLOTS } from "@/lib/schedule";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { TrainingForm } from "@/components/sport/TrainingForm";
import { AttendanceSheet } from "@/components/sport/AttendanceSheet";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Entraînements" };

export default async function EntrainementsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const canManage = hasPermission(user.role, "sport.manage");
  const supabase = createClient();
  const nextTraining = getNextTraining();

  const [{ data: sessions }, players] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("*")
      .order("session_date", { ascending: false })
      .limit(20),
    canManage ? fetchPlayers(supabase) : Promise.resolve([]),
  ]);

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: attendances } =
    sessionIds.length > 0
      ? await supabase
          .from("attendances")
          .select("session_id, player_id, present")
          .in("session_id", sessionIds)
      : { data: [] };

  const presentBySession = new Map<string, string[]>();
  (attendances ?? []).forEach((a) => {
    if (!a.present) return;
    const list = presentBySession.get(a.session_id) ?? [];
    list.push(a.player_id);
    presentBySession.set(a.session_id, list);
  });

  return (
    <DashboardShell
      title="Entraînements"
      description="Séances du mercredi, samedi et dimanche, et feuilles de présence."
    >
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        {WEEKLY_TRAINING_SLOTS.map((slot) => {
          const isNext = nextTraining.slot.label === slot.label;
          return (
            <div
              key={slot.label}
              className={
                isNext
                  ? "rounded-2xl border-2 border-club-green-500 bg-club-green-50 p-4"
                  : "rounded-2xl border border-slate-200 bg-white p-4"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-club-navy-900">
                  {slot.label}
                </p>
                {isNext ? <Badge tone="green">Prochaine</Badge> : null}
              </div>
              <p className="mt-1 text-lg font-black text-club-sky-700">
                {slot.time.replace(":", "h")}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {!sessions || sessions.length === 0 ? (
            <EmptyState
              title="Aucune séance enregistrée"
              description="Créez la première séance d'entraînement."
            />
          ) : (
            sessions.map((session) => (
              <section
                key={session.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-club-navy-900">
                      {session.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatDate(session.session_date)}
                      {session.start_time ? ` · ${session.start_time}` : ""}
                      {session.location ? ` · ${session.location}` : ""}
                    </p>
                    {session.notes ? (
                      <p className="mt-2 text-sm text-slate-600">
                        {session.notes}
                      </p>
                    ) : null}
                  </div>
                  <Badge tone="sky">
                    {(presentBySession.get(session.id) ?? []).length} présents
                  </Badge>
                </div>

                {canManage ? (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <AttendanceSheet
                      sessionId={session.id}
                      players={players}
                      initialPresent={presentBySession.get(session.id) ?? []}
                    />
                  </div>
                ) : null}
              </section>
            ))
          )}
        </div>

        {canManage ? (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <h3 className="section-title mb-4">Nouvelle séance</h3>
              <TrainingForm />
            </div>
          </aside>
        ) : null}
      </div>
    </DashboardShell>
  );
}