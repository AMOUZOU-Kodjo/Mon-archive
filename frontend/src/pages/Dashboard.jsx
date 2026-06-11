import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineRefresh, HiOutlineSearch,
  HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlinePlusCircle,
  HiOutlineClock, HiOutlineChartSquareBar, HiOutlineUpload,
  HiOutlineLink, HiOutlineChevronRight, HiOutlineViewGrid,
} from 'react-icons/hi';
import api from '../utils/api';
import AddMediaForm from '../components/AddMediaForm';
import ImportPdfForm from '../components/ImportPdfForm';
import MediaCard from '../components/MediaCard';
import EditMediaModal from '../components/EditMediaModal';
import Pagination from '../components/Pagination';
import { StatsSkeleton, CardSkeleton } from '../components/SkeletonLoader';

const sections = [
  { key: 'photos', label: 'Photos', type: 'photo', icon: HiOutlinePhotograph, color: 'primary' },
  { key: 'videos', label: 'Videos', type: 'video', icon: HiOutlineVideoCamera, color: 'secondary' },
  { key: 'audios', label: 'Audios', type: 'audio', icon: HiOutlineMusicNote, color: 'accent' },
  { key: 'documents', label: 'Documents', type: 'document', icon: HiOutlineDocumentText, color: 'info' },
];

const sectionToType = { photos: 'photo', videos: 'video', audios: 'audio', documents: 'document' };

const categories = [
  { value: '', label: 'Tout' },
  { value: 'Cours', label: 'Cours' },
  { value: 'Révision', label: 'Révision' },
  { value: 'Examen', label: 'Examen' },
  { value: 'Exercice', label: 'Exercice' },
];

export default function Dashboard() {
  const { section } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingMedia, setEditingMedia] = useState(null);
  const [dashboardPage, setDashboardPage] = useState(1);
  const [recentMedia, setRecentMedia] = useState([]);
  const [showImportPdf, setShowImportPdf] = useState(false);
  const recentFetched = useRef(false);
  const DASHBOARD_LIMIT = 20;

  const fetchStats = async () => {
    try {
      const response = await api.get('/medias/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMediaByType = async (sectionKey) => {
    setMediaLoading(true);
    try {
      const type = sectionToType[sectionKey];
      const res = await api.get(`/medias?type=${type}`);
      setMediaItems(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (!recentFetched.current) {
      recentFetched.current = true;
      api.get('/medias?limit=6')
        .then((r) => setRecentMedia(r.data.data || []))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (section) {
      fetchMediaByType(section);
      setShowAddForm(false);
      setSearchTerm('');
      setSelectedCategory('');
    } else {
      setMediaItems([]);
    }
  }, [section]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleAddComplete = () => {
    setShowAddForm(false);
    if (section) fetchMediaByType(section);
    handleRefresh();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce media ?')) return;
    try {
      await api.delete(`/medias/${id}`);
      if (section) fetchMediaByType(section);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSaved = () => {
    if (section) fetchMediaByType(section);
    fetchStats();
  };

  // Vue d'ensemble (stats)
  if (!section) {
    const total = stats ? Number(stats.total) || 0 : 0;
    const ph = Number(stats?.photos) || 0;
    const vd = Number(stats?.videos) || 0;
    const ad = Number(stats?.audios) || 0;
    const dc = Number(stats?.documents) || 0;
    const maxVal = Math.max(ph, vd, ad, dc, 1);

    const counts = [
      { key: 'photos', label: 'Photos', icon: HiOutlinePhotograph, count: ph, color: 'primary', bg: 'from-primary/20 to-primary/5', path: '/dashboard/photos' },
      { key: 'videos', label: 'Videos', icon: HiOutlineVideoCamera, count: vd, color: 'secondary', bg: 'from-secondary/20 to-secondary/5', path: '/dashboard/videos' },
      { key: 'audios', label: 'Audios', icon: HiOutlineMusicNote, count: ad, color: 'accent', bg: 'from-accent/20 to-accent/5', path: '/dashboard/audios' },
      { key: 'documents', label: 'Documents', icon: HiOutlineDocumentText, count: dc, color: 'info', bg: 'from-info/20 to-info/5', path: '/dashboard/documents' },
    ];

    const today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    return (
      <div className="space-y-6">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 via-base-100/95 to-base-200 border border-base-200 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-base-content/40 mb-1">
                  <HiOutlineClock className="text-sm" />
                  <span className="capitalize">{today}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
                <p className="text-sm text-base-content/60 mt-1">Vue d'ensemble de votre archive</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleRefresh} disabled={refreshing} className="btn btn-ghost btn-sm gap-1">
                  <HiOutlineRefresh className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                <button onClick={() => { setShowAddForm(false); setShowImportPdf(false); }} className="btn btn-ghost btn-sm gap-1">
                  <HiOutlineViewGrid className="text-base" />
                  Sections
                </button>
              </div>
            </div>

            {loading ? (
              <StatsSkeleton />
            ) : stats ? (
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {/* Carte Total */}
                <div className="relative col-span-2 sm:col-span-1 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/15 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <HiOutlineBookOpen className="text-primary text-sm" />
                    </div>
                    <span className="text-xs font-medium text-base-content/50 uppercase tracking-wider">Total</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{total}</p>
                  <p className="text-[10px] text-base-content/30 mt-1">media(s) archives</p>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[18px] opacity-20 text-primary">&#9679;&#9679;&#9679;</span>
                  </div>
                </div>

                {/* Cartes par type */}
                {counts.map((c) => {
                  const Icon = c.icon;
                  const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                  return (
                    <Link
                      key={c.key}
                      to={c.path}
                      className={`relative bg-gradient-to-br ${c.bg} rounded-xl border border-${c.color}/15 p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-8 h-8 rounded-lg bg-${c.color}/15 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`text-${c.color} text-sm`} />
                        </div>
                        <span className="text-xs font-medium text-base-content/50 uppercase tracking-wider">{c.label}</span>
                      </div>
                      <p className={`text-2xl font-bold text-${c.color}`}>{c.count}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-base-content/30">{pct}% du total</span>
                        <HiOutlineChevronRight className="text-xs text-base-content/20 group-hover:text-base-content/50 transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Distribution bar */}
        {stats && total > 0 && (
          <div className="bg-base-100 rounded-xl border border-base-200 p-4 md:p-5">
            <div className="flex items-center gap-2 mb-4">
              <HiOutlineChartSquareBar className="text-primary text-lg" />
              <h2 className="font-semibold text-sm">Repartition du stockage</h2>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-base-200">
              {[
                { val: ph, color: 'bg-primary', label: 'Photos' },
                { val: vd, color: 'bg-secondary', label: 'Videos' },
                { val: ad, color: 'bg-accent', label: 'Audios' },
                { val: dc, color: 'bg-info', label: 'Documents' },
              ].map((item) => {
                const width = total > 0 ? (item.val / total) * 100 : 0;
                if (width === 0) return null;
                return (
                  <div
                    key={item.label}
                    className={`${item.color} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                    style={{ width: `${width}%` }}
                    title={`${item.label}: ${item.val}`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-base-content/50">
              {[
                { val: ph, color: 'bg-primary', label: 'Photos' },
                { val: vd, color: 'bg-secondary', label: 'Videos' },
                { val: ad, color: 'bg-accent', label: 'Audios' },
                { val: dc, color: 'bg-info', label: 'Documents' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-sm ${item.color}`} />
                  {item.label} ({item.val})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides + Ajouts recents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actions rapides */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <HiOutlinePlusCircle className="text-primary" />
              Actions rapides
            </h2>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setShowImportPdf(false); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-base-100 border border-base-200 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiOutlineUpload className="text-primary text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Ajouter un fichier</p>
                <p className="text-xs text-base-content/50">Photo, video, audio ou document</p>
              </div>
              <HiOutlineChevronRight className="text-base-content/20 group-hover:text-base-content/50 transition-colors" />
            </button>

            <button
              onClick={() => { setShowImportPdf(!showImportPdf); setShowAddForm(false); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-base-100 border border-base-200 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HiOutlineLink className="text-accent text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Importer un PDF</p>
                <p className="text-xs text-base-content/50">Depuis une URL externe</p>
              </div>
              <HiOutlineChevronRight className="text-base-content/20 group-hover:text-base-content/50 transition-colors" />
            </button>
          </div>

          {/* Ajouts recents */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-xl border border-base-200 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiOutlineClock className="text-primary text-lg" />
                  <h2 className="font-semibold text-sm">Ajouts recents</h2>
                </div>
                {recentMedia.length > 0 && (
                  <Link to="/photos" className="text-xs text-primary hover:underline">
                    Voir tout
                  </Link>
                )}
              </div>

              {recentMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-base-content/30">
                  <HiOutlineUpload className="text-3xl mb-2" />
                  <p className="text-sm">Aucun media pour le moment</p>
                  <p className="text-xs mt-1">Ajoutez vos premiers fichiers avec les actions rapides</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentMedia.map((item) => {
                    const sec = sections.find((s) => s.type === item.type);
                    const Icon = sec?.icon || HiOutlineBookOpen;
                    const color = sec?.color || 'primary';
                    const date = new Date(item.date_creation).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    });
                    return (
                      <Link
                        key={item.id}
                        to={`/${sec?.key || 'photos'}/${item.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors group"
                      >
                        <div className={`w-9 h-9 rounded-lg bg-${color}/10 flex items-center justify-center shrink-0`}>
                          <Icon className={`text-${color} text-sm`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.titre}</p>
                          <p className="text-xs text-base-content/40">{date}</p>
                        </div>
                        <span className={`badge badge-xs badge-${color} capitalize`}>{sec?.label?.slice(0, -1) || item.type}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="card bg-base-100 shadow-sm border border-base-200 slide-up max-w-2xl">
            <div className="card-body p-4">
              <AddMediaForm onAddComplete={handleAddComplete} />
            </div>
          </div>
        )}

        {showImportPdf && (
          <div className="card bg-base-100 shadow-sm border border-base-200 slide-up max-w-2xl">
            <div className="card-body p-4">
              <ImportPdfForm onAddComplete={handleAddComplete} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Gestion d'un type de media spécifique
  const currentSection = sections.find((s) => s.key === section);
  if (!currentSection) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
        <p className="text-lg font-medium">Section inconnue</p>
        <Link to="/dashboard" className="btn btn-primary btn-sm mt-4">Retour au tableau de bord</Link>
      </div>
    );
  }

  const Icon = currentSection.icon;

  const filtered = mediaItems.filter((m) => {
    if (selectedCategory && m.categorie?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return m.titre.toLowerCase().includes(t) || m.description?.toLowerCase().includes(t) || m.tags?.toLowerCase().includes(t);
  });

  const dashboardTotalPages = Math.max(1, Math.ceil(filtered.length / DASHBOARD_LIMIT));
  const paginatedItems = filtered.slice(
    (dashboardPage - 1) * DASHBOARD_LIMIT,
    dashboardPage * DASHBOARD_LIMIT
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="btn btn-ghost btn-sm btn-square" title="Retour">
            <HiOutlineArrowLeft className="text-lg" />
          </Link>
          <Icon className={`text-2xl text-${currentSection.color}`} />
          <div>
            <h1 className="text-xl font-bold">Gestion des {currentSection.label}</h1>
            <p className="text-base-content/60 text-sm">{filtered.length} media(s) &mdash; page {dashboardPage}/{dashboardTotalPages}</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm shadow-sm">
          {showAddForm ? 'Annuler' : `+ Ajouter ${currentSection.label.slice(0, -1)}`}
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="join flex-1">
          <div className="join-item flex items-center pl-3 bg-base-100 border border-base-300 rounded-l-lg">
            <HiOutlineSearch className="text-base-content/40 text-lg" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par titre, description..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setDashboardPage(1); }}
            className="join-item input input-bordered flex-1 border-l-0 rounded-r-lg focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setSelectedCategory(cat.value); setDashboardPage(1); }}
            className={`btn btn-sm rounded-full ${
              selectedCategory === cat.value ? 'btn-primary' : 'btn-ghost bg-base-200/50 hover:bg-base-200'
            }`}
          >
            {cat.icon && <cat.icon className="text-sm" />}
            {cat.label}
          </button>
        ))}
      </div>

      {showAddForm && (
        <div className="card bg-base-100 shadow-sm border border-base-200 slide-up">
          <div className="card-body p-4 space-y-4">
            <AddMediaForm onAddComplete={handleAddComplete} mediaType={currentSection.type} />
            {currentSection.type === 'document' && (
              <div className="divider text-xs text-base-content/30">OU</div>
            )}
            {currentSection.type === 'document' && (
              <ImportPdfForm onAddComplete={handleAddComplete} />
            )}
          </div>
        </div>
      )}

      {mediaLoading ? (
        <CardSkeleton count={8} />
      ) : paginatedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
          <Icon className="text-6xl mb-4" />
          <p className="text-lg font-medium">
            {searchTerm || selectedCategory
              ? 'Aucun résultat trouvé'
              : `Aucun ${currentSection.label.toLowerCase()}`}
          </p>
          <p className="text-sm">
            {searchTerm || selectedCategory
              ? 'Essayez de modifier vos filtres.'
              : 'Ajoutez vos premiers medias avec le bouton ci-dessus.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedItems.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onClick={() => navigate(`/${section}/${item.id}`)}
                onEdit={setEditingMedia}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <Pagination page={dashboardPage} totalPages={dashboardTotalPages} onPageChange={setDashboardPage} />
        </>
      )}

      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
