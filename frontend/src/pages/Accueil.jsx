import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import MediaCard from '../components/MediaCard';
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineEye, HiOutlineDownload,
  HiOutlineAnnotation, HiOutlineArchive, HiOutlineChevronLeft,
  HiOutlineChevronRight, HiOutlineUser, HiOutlineLocationMarker,
  HiOutlineBriefcase, HiOutlineMail,
} from 'react-icons/hi';
import api from '../utils/api';

const sections = [
  { path: '/photos', icon: HiOutlinePhotograph, title: 'Photos', desc: 'Images et photographies', color: 'primary', countKey: 'photos' },
  { path: '/videos', icon: HiOutlineVideoCamera, title: 'Videos', desc: 'Fichiers video integres', color: 'secondary', countKey: 'videos' },
  { path: '/audios', icon: HiOutlineMusicNote, title: 'Audios', desc: 'Pistes audio et podcasts', color: 'accent', countKey: 'audios' },
  { path: '/documents', icon: HiOutlineDocumentText, title: 'Documents', desc: 'PDF, Word, Excel et plus', color: 'info', countKey: 'documents' },
];

const highlights = [
  { icon: HiOutlineEye, label: 'Visionnez', desc: 'Photos, videos, documents en un clic', color: 'text-primary' },
  { icon: HiOutlineDownload, label: 'Telechargez', desc: 'Acces direct depuis n\'importe ou', color: 'text-secondary' },
  { icon: HiOutlineAnnotation, label: 'Commentez', desc: 'Echangez sur chaque media', color: 'text-accent' },
];

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display}</span>;
}

export default function Accueil() {
  const { authenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchData = () => {
    api.get('/medias/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/medias?search=').then((r) => setRecent((r.data.data || r.data).slice(0, 5))).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (recent.length <= 1) return;
    intervalRef.current = setInterval(() => {
      if (carouselRef.current) {
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
        const next = carouselRef.current.scrollLeft + 320;
        if (next >= maxScroll) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [recent.length]);

  const scrollCarousel = (dir) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  const total = stats ? Number(stats.total) || 0 : 0;
  const statItems = [
    { value: Number(stats?.photos) || 0, label: 'Photos', icon: HiOutlinePhotograph, color: 'primary' },
    { value: Number(stats?.videos) || 0, label: 'Videos', icon: HiOutlineVideoCamera, color: 'secondary' },
    { value: Number(stats?.audios) || 0, label: 'Audios', icon: HiOutlineMusicNote, color: 'accent' },
    { value: Number(stats?.documents) || 0, label: 'Documents', icon: HiOutlineDocumentText, color: 'info' },
  ];

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20 page-enter">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="badge badge-primary badge-outline mb-4 px-4 py-2 text-xs tracking-wide">
            <HiOutlineArchive className="text-sm mr-1" />
            {total > 0 ? `${total} media(s) archives` : 'Espace personnel securise'}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
            Vos fichiers, centralises et{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              accessibles partout
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-base-content/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Une plateforme privee pour archiver, organiser et partager vos photos, videos,
            musiques et documents en toute simplicite.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {authenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-lg shadow-lg px-8">
                  Tableau de bord
                </Link>
                <Link to="/photos" className="btn btn-ghost btn-lg px-8">
                  Parcourir
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg shadow-lg px-8">
                  Acceder a mon espace
                </Link>
                <a href="#medias" className="btn btn-ghost btn-lg px-8">
                  Decouvrir
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {stats && (
        <section className="py-10 bg-base-100 border-y border-base-200/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="stat place-items-center bg-primary/5 rounded-2xl py-4 border border-primary/10">
                <div className="stat-figure text-primary">
                  <HiOutlineArchive className="text-2xl" />
                </div>
                <div className="stat-value text-3xl font-bold text-primary">
                  <AnimatedNumber value={total} />
                </div>
                <div className="stat-title text-xs font-medium uppercase tracking-wider">Total</div>
              </div>

              {statItems.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`stat place-items-center bg-${s.color}/5 rounded-2xl py-4 border border-${s.color}/10`}>
                    <div className={`stat-figure text-${s.color}`}>
                      <Icon className="text-2xl" />
                    </div>
                    <div className={`stat-value text-3xl font-bold text-${s.color}`}>
                      <AnimatedNumber value={s.value} />
                    </div>
                    <div className="stat-title text-xs font-medium uppercase tracking-wider">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} className="flex items-start gap-4 p-4 rounded-xl bg-base-100 border border-base-200/50 hover:shadow-sm transition-shadow">
                  <div className={`${h.color} bg-base-200 p-3 rounded-xl shrink-0`}>
                    <Icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{h.label}</h3>
                    <p className="text-sm text-base-content/60">{h.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="medias" className="py-16 bg-base-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Explorer par type</h2>
            <p className="text-base-content/60">Choisissez une categorie pour parcourir son contenu</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const count = stats ? Number(stats[sec.countKey]) || 0 : 0;
              return (
                <Link
                  key={sec.title}
                  to={sec.path}
                  className={`card bg-base-200/50 border border-base-200/80 hover:border-${sec.color}/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}
                >
                  <div className="card-body items-center text-center p-5">
                    <div className={`w-12 h-12 rounded-xl bg-${sec.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className={`text-2xl text-${sec.color}`} />
                    </div>
                    <h3 className="font-semibold">{sec.title}</h3>
                    <p className="text-xs text-base-content/50 mt-1">{count} fichier(s)</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="py-16 border-t border-base-200/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Ajouts recents</h2>
                <p className="text-sm text-base-content/60 mt-1">Les derniers fichiers ajoutes</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => scrollCarousel(-1)} className="btn btn-ghost btn-sm btn-square">
                  <HiOutlineChevronLeft className="text-lg" />
                </button>
                <button onClick={() => scrollCarousel(1)} className="btn btn-ghost btn-sm btn-square">
                  <HiOutlineChevronRight className="text-lg" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                ref={carouselRef}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {recent.map((item) => (
                  <div key={item.id} className="snap-start shrink-0 w-[280px]">
                    <MediaCard
                      media={item}
                      onClick={() => window.location.href = `/${item.type}s/${item.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* A propos du createur */}
      <section className="py-16 bg-base-100 border-t border-base-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <HiOutlineUser className="text-4xl text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold">Kodjo AMOUZOU</h2>
              <p className="text-primary font-medium text-sm">Chef de projet & Developpeur</p>
              <p className="text-sm text-base-content/60 mt-2 max-w-xl leading-relaxed">
                Passionne par le developpement web et la creation d'applications modernes.
                Mon Archive est ne de la volonte de centraliser et d'organiser les fichiers
                numeriques de maniere simple, securisee et accessible partout.
              </p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-base-content/50 justify-center md:justify-start">
                <span className="flex items-center gap-1">
                  <HiOutlineLocationMarker className="text-primary" /> Lome, Togo
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineBriefcase className="text-primary" /> IADES
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineMail className="text-primary" /> Contact
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {authenticated ? 'Pret a gerer vos medias ?' : 'Envie de tester ?'}
          </h2>
          <p className="text-base-content/60 mb-8 max-w-xl mx-auto">
            {authenticated
              ? 'Accedez a votre tableau de bord pour ajouter, organiser et gerer tous vos fichiers en un clin d\'oeil.'
              : 'Connectez-vous pour acceder a votre espace personnel securise et centralise.'}
          </p>
          {authenticated ? (
            <Link to="/dashboard" className="btn btn-primary btn-lg shadow-lg px-10">
              Tableau de bord
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-lg shadow-lg px-10">
              Se connecter
            </Link>
          )}
        </div>
      </section>

      <footer className="py-8 border-t border-base-200 bg-base-100">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-base-content/40">
          <p>&copy; {new Date().getFullYear()} Mon Archive.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-base-content/60 transition-colors">A propos</Link>
            <Link to="/photos" className="hover:text-base-content/60 transition-colors">Photos</Link>
            <Link to="/videos" className="hover:text-base-content/60 transition-colors">Videos</Link>
            <Link to="/audios" className="hover:text-base-content/60 transition-colors">Audios</Link>
            <Link to="/documents" className="hover:text-base-content/60 transition-colors">Documents</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
