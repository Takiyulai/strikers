/* eslint-disable @next/next/no-img-element */

const STAFF = [
  {
    name: "AHOUASSOU Eude",
    role: "Président d'honneur",
    accent: "bg-amber-100 text-amber-800",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=640&q=80",
    bio: "Moteur et conscience du club. Sa passion pour le ballon rond ne prend jamais de repos : présent à chaque séance, attentif au moindre détail, il met son énergie et ses moyens au service d'une seule idée — voir Striker FC toujours au top des tops. Son exigence fait grandir chacun, sa fidélité cimente le groupe.",
  },
  {
    name: "MOUSSA B. Mouktadine",
    role: "Président",
    accent: "bg-club-navy-100 text-club-navy-800",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&q=80",
    bio: "À la direction du club, il structure, décide et fédère. Sa vision claire et son sens de l'organisation donnent à l'équipe les moyens concrets de ses ambitions, sur le terrain comme en dehors.",
  },
  {
    name: "DJIBRIL Assirou",
    role: "Coach",
    accent: "bg-club-green-100 text-club-green-800",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
    bio: "Stratège du jeu, il bâtit chaque séance avec rigueur et transmet au groupe sa culture de l'effort. Sous sa conduite, la progression n'est pas une option : c'est une exigence quotidienne.",
  },
  {
    name: "SANDA B. Abdel Hafid",
    role: "Trésorier Général",
    accent: "bg-club-sky-100 text-club-sky-800",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=640&q=80",
    bio: "Sentinelle des finances du club, il garantit la transparence de chaque franc collecté et de chaque franc dépensé. Sa rigueur sécurise les projets de l'équipe et la confiance de tous.",
  },
];

export function StaffSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-club-sky-600">
            Le staff
          </p>
          <h2 className="mt-2 text-3xl font-black text-club-navy-900 sm:text-4xl">
            Ceux qui font avancer le club
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Derrière chaque match, il y a un staff engagé au quotidien — pour
            l&apos;encadrement, la discipline et la solidarité de l&apos;équipe.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STAFF.map((member) => (
            <article
              key={member.name}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="aspect-[4/5] overflow-hidden bg-club-navy-100">
                <img
                  src={member.photo}
                  alt={`Portrait de ${member.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${member.accent}`}
                >
                  {member.role}
                </span>
                <h3 className="mt-3 text-base font-black uppercase tracking-wide text-club-navy-900">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {member.bio}
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Photos d&apos;illustration — à remplacer par les photos officielles du
          staff.
        </p>
      </div>
    </section>
  );
}
