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
    <section id="valeurs" className="relative overflow-hidden bg-white px-5 py-24 sm:px-8 sm:py-28">
      <div className="absolute -right-32 top-12 h-80 w-80 rounded-full bg-club-sky-100/60 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20">
        <div className="max-w-lg">
          <p className="eyebrow">
            Notre objectif
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.04em] text-club-navy-950 sm:text-5xl">
            Les valeurs qui nous font avancer.
          </h2>
          <p className="mt-6 text-base leading-7 text-slate-600">
            Striker FC est bien plus qu&apos;une équipe de football : c&apos;est
            une famille soudée par la passion du ballon rond. Chaque
            entraînement, chaque match est une occasion de grandir ensemble.
          </p>
          <div className="mt-8 h-1 w-20 rounded-full bg-gradient-to-r from-club-sky-500 to-club-green-400" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {VALUES.map((value, index) => (
            <div
              key={value.title}
              className={`group rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-club-sky-200 hover:shadow-card-hover ${index % 2 ? "sm:translate-y-7 sm:hover:translate-y-6" : ""}`}
            >
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-club-navy-950 text-club-sky-300 transition-colors group-hover:bg-club-sky-500 group-hover:text-white">
                <value.icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <h3 className="text-lg font-extrabold text-club-navy-950">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {value.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
