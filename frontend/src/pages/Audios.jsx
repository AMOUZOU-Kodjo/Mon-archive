import { useState, useEffect } from 'react';
import { HiOutlineMusicNote } from 'react-icons/hi';
import api from '../utils/api';
import AudioPlayer from '../components/AudioPlayer';
import HeroStats from '../components/HeroStats';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';

export default function Audios() {
  const [audios, setAudios] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: 'audio', page, limit: 12 });
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('categorie', selectedCategory);
    Promise.all([
      api.get(`/medias?${params}`),
      api.get('/medias/stats'),
    ])
      .then(([medias, statsRes]) => {
        setAudios(medias.data.data);
        setPagination(medias.data.pagination);
        setStats(statsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <HeroStats
        stats={stats}
        label="Audios"
        icon={HiOutlineMusicNote}
        color="accent"
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); setPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(value) => { setSelectedCategory(value); setPage(1); }}
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-base-300 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : audios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
          <HiOutlineMusicNote className="text-6xl mb-4" />
          <p className="text-lg font-medium">Aucun audio trouvé</p>
          <p className="text-sm">Essayez de modifier vos filtres ou revenez plus tard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audios.map((audio) => (
            <AudioPlayer key={audio.id} media={audio} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={pagination?.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
