import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineArchive, HiOutlineUser,
  HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineMail,
  HiOutlineCode, HiOutlineDeviceMobile,
} from 'react-icons/hi';

const mediaTypes = [
  { icon: HiOutlinePhotograph, title: 'Photos', desc: 'Galerie interactive avec apercu plein ecran', color: 'primary' },
  { icon: HiOutlineVideoCamera, title: 'Videos', desc: 'Lecteur integre pour vos videos', color: 'secondary' },
  { icon: HiOutlineMusicNote, title: 'Audios', desc: 'Lecteur audio et telechargement', color: 'accent' },
  { icon: HiOutlineDocumentText, title: 'Documents', desc: 'Visionneuse PDF et apercus', color: 'info' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 page-enter">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
        <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="badge badge-primary badge-outline mb-4 px-4 py-2 text-xs tracking-wide">
            <HiOutlineArchive className="text-sm mr-1" />
            A propos
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            A propos de{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mon Archive
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Une plateforme privee pour archiver, organiser et partager vos photos, videos,
            musiques et documents en toute simplicite.
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 bg-base-100 border-y border-base-200/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-base text-base-content/70 leading-relaxed">
            Mon Archive est un espace personnel securise permettant de centraliser,
            organiser et partager l'ensemble de vos fichiers numeriques
            (photos, videos, audios, documents) en un seul endroit.
            Chaque media peut etre commente, tagge et retrouve facilement
            grace a une recherche intelligente.
          </p>
        </div>
      </section>

      {/* Medias supportes */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Medias supportes</h2>
            <p className="text-base-content/60">Types de fichiers que vous pouvez archiver</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mediaTypes.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="card bg-base-200/40 border border-base-200/80 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="card-body items-center text-center p-5">
                    <div className={`w-12 h-12 rounded-xl bg-${m.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`text-2xl text-${m.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm">{m.title}</h3>
                    <p className="text-xs text-base-content/60 mt-1">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Createur */}
      <section className="py-16 bg-base-100 border-y border-base-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Qui suis-je ?</h2>
            <p className="text-base-content/60">Le createur de Mon Archive</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 max-w-2xl mx-auto">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <HiOutlineUser className="text-5xl text-white" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold">Kodjo AMOUZOU</h3>
              <p className="text-primary font-medium">Chef de projet & Developpeur</p>
              <p className="text-sm text-base-content/60 mt-3 leading-relaxed">
                Passionne par le developpement web et les technologies numeriques,
                je conçois des applications modernes et fonctionnelles.
                Mon Archive est mon projet personnel, alliant securite,
                simplicite et performance pour offrir une experience de
                gestion de fichiers optimale.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-base-content/50 justify-center md:justify-start">
                <span className="flex items-center gap-1">
                  <HiOutlineLocationMarker className="text-primary" /> Lome, Togo
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineBriefcase className="text-primary" /> IADES
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                <span className="badge badge-sm badge-ghost gap-1">
                  <HiOutlineCode /> React
                </span>
                <span className="badge badge-sm badge-ghost gap-1">
                  <HiOutlineCode /> Node.js
                </span>
                <span className="badge badge-sm badge-ghost gap-1">
                  <HiOutlineDeviceMobile /> Full-Stack
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <HiOutlineArchive className="text-5xl text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Pret a centraliser vos fichiers ?</h2>
          <p className="text-base-content/70 mb-8 max-w-lg mx-auto">
            Accedez a votre espace securise pour gerer, organiser et retrouver
            tous vos medias en un clin d'oeil.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn btn-primary shadow-lg px-8">
              Se connecter
            </Link>
            <Link to="/" className="btn btn-ghost px-8">
              Accueil
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-base-200 bg-base-100">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-base-content/40">
          <p>&copy; {new Date().getFullYear()} Mon Archive. Concu par Kodjo AMOUZOU.</p>
        </div>
      </footer>
    </div>
  );
}
