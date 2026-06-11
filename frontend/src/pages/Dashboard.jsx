import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlineMusicNote,
  HiOutlineDocumentText, HiOutlineRefresh, HiOutlineSearch,
  HiOutlineArrowLeft, HiOutlineBookOpen,
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
  { value: 'cours', label: 'Cours' },
  { value: 'révision', label: 'Révision' },
  { value: 'examen', label: 'Examen' },
  { value: 'exercice', label: 'Exercice' },
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
    const counts = [
      { key: 'photos', label: 'Photos', icon: HiOutlinePhotograph, count: Number(stats?.photos) || 0, color: 'primary', path: '/dashboard/photos' },
      { key: 'videos', label: 'Videos', icon: HiOutlineVideoCamera, count: Number(stats?.videos) || 0, color: 'secondary', path: '/dashboard/videos' },
      { key: 'audios', label: 'Audios', icon: HiOutlineMusicNote, count: Number(stats?.audios) || 0, color: 'accent', path: '/dashboard/audios' },
      { key: 'documents', label: 'Documents', icon: HiOutlineDocumentText, count: Number(stats?.documents) || 0, color: 'info', path: '/dashboard/documents' },
    ];

    return (
      <div className="space-y-8">
        {/* Stats hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-100 via-base-100/95 to-base-200 border border-base-200 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
                <p className="text-sm text-base-content/60">Vue d'ensemble de votre archive</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleRefresh} disabled={refreshing} className="btn btn-ghost btn-sm gap-1">
                  <HiOutlineRefresh className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </button>
                <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary btn-sm shadow-sm">
                  {showAddForm ? 'Annuler' : '+ Ajouter un media'}
                </button>
              </div>
            </div>

            {loading ? (
              <StatsSkeleton />
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="stat bg-primary/5 rounded-xl border border-primary/10 p-4 col-span-2 md:col-span-1">
                  <div className="flex items-center gap-2">
                    <HiOutlineBookOpen className="text-xl text-primary opacity-70" />
                    <span className="stat-title text-xs">Total</span>
                  </div>
                  <p className="stat-value text-2xl font-bold text-primary mt-1">{total}</p>
                </div>
                {counts.map((c) => {
                  const Icon = c.icon;
                  return (
                    <Link key={c.key} to={c.path} className={`stat bg-${c.color}/5 rounded-xl border border-${c.color}/10 p-4 hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`text-xl text-${c.color} opacity-70`} />
                        <span className="stat-title text-xs">{c.label}</span>
                      </div>
                      <p className={`stat-value text-2xl font-bold text-${c.color} mt-1`}>{c.count}</p>
                      <span className="text-[10px] text-base-content/30 mt-1 block">Gérer &rarr;</span>
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {showAddForm && (
          <div className="card bg-base-100 shadow-sm border border-base-200 slide-up max-w-2xl">
            <div className="card-body p-4">
              <AddMediaForm onAddComplete={handleAddComplete} />
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
