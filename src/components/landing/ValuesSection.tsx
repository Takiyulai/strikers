import { Target, TrendingUp, Trophy, Users } from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Discipline",
    text: "Rigueur à l'entraînement, ponctualité et respect des engagements : les bases de toute victoire.",
  },
  {
    icon: Users,
    title: "Collectif",
    text: "Un groupe uni et solidaire, qui joue et progresse ensemble, sur le terrain comme en dehors.",
  },
  {
    icon: TrendingUp,
    title: "Progression",
    text: "Viser toujours mieux, séance après séance. Chaque erreur devient une leçon.",
  },
  {
    icon: Trophy,
    title: "Ambition",
    text: "Repousser nos limites et porter haut les couleurs de Striker FC.",
  },
];

export function ValuesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-club-sky-600">
            Notre objectif
          </p>
          <h2 className="mt-2 text-3xl font-black text-club-navy-900 sm:text-4xl">
            Un collectif, une ambition
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            Striker FC est bien plus qu&apos;une équipe de football : c&apos;est
            une famille soudée par la passion du ballon rond. Chaque
            entraînement, chaque match est une occasion de grandir ensemble.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Notre vision repose sur quatre piliers qui guident chacun de nos
            choix, du vestiaire au terrain.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-club-green-50 text-club-green-600">
                <value.icon className="h-5 w-5" />
              </span>
              <h3 className="text-sm font-bold text-club-navy-900">
                {value.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
