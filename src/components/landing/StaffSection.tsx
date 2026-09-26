/* eslint-disable @next/next/no-img-element */

const STAFF = [
  {
  name: "AHOUASSOU Eude",
  role: "Président d'honneur",
  accent: "bg-amber-100 text-amber-800",
  photo: "/images/ho.jpeg",
  bio: "Moteur et conscience du club. Avec une grande humilité, il met sa passion, son expérience et ses moyens au service de Striker FC. Présent, attentif et toujours disponible, il veille au moindre détail et accompagne le groupe avec discrétion et bienveillance. Son exigence fait grandir chacun, tandis que sa fidélité et son engagement nourrissent une ambition simple : voir Striker FC toujours au meilleur de lui-même.",
},
  {
    name: "MOUSSA B. Mouktadine",
    role: "Président",
    accent: "bg-club-navy-100 text-club-navy-800",
    photo:
      "/images/pr.jpeg",
    bio: "À la direction du club, il structure, décide et fédère. Sa vision claire et son sens de l'organisation donnent à l'équipe les moyens concrets de ses ambitions, sur le terrain comme en dehors.",
  },
  {
    name: "DJIBRIL Assirou",
    role: "Coach",
    accent: "bg-club-green-100 text-club-green-800",
    photo:
      "/images/ch.jpeg",
    bio: "Stratège du jeu, il bâtit chaque séance avec rigueur et transmet au groupe sa culture de l'effort. Sous sa conduite, la progression n'est pas une option : c'est une exigence quotidienne.",
  },
  {
    name: "SANDA B. Abdel Hafid",
    role: "Trésorier Général",
    accent: "bg-club-sky-100 text-club-sky-800",
    photo:
      "/images/tg.jpeg",
    bio: "Sentinelle des finances du club, il garantit la transparence de chaque franc collecté et de chaque franc dépensé. Sa rigueur sécurise les projets de l'équipe et la confiance de tous.",
  },
];

export function StaffSection() {
  return (
    <section id="staff" className="bg-club-navy-950 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-club-sky-400">
            Le staff
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
            Ceux qui font avancer le club
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
            Derrière chaque match, il y a un staff engagé au quotidien — pour
            l&apos;encadrement, la discipline et la solidarité de l&apos;équipe.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAFF.map((member) => (
            <article
              key={member.name}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.09]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-club-navy-800">
                <img
                  src={member.photo}
                  alt={`Portrait de ${member.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-club-navy-950/70 via-transparent to-transparent" />
              </div>
              <div className="p-5">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${member.accent}`}
                >
                  {member.role}
                </span>
                <h3 className="mt-4 text-base font-black uppercase tracking-wide text-white">
                  {member.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  {member.bio}
                </p>
              </div>
            </article>
          ))}
        </div>


      </div>
    </section>
  );
}
