import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePhotograph } from 'react-icons/hi';
import api from '../utils/api';
import MediaCard from '../components/MediaCard';
import HeroStats from '../components/HeroStats';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function Photos() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: 'photo', page, limit: 12 });
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('categorie', selectedCategory);
    Promise.all([
      api.get(`/medias?${params}`),
      api.get('/medias/stats'),
    ])
      .then(([medias, statsRes]) => {
        setPhotos(medias.data.data);
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
        label="Photos"
        icon={HiOutlinePhotograph}
        color="primary"
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); setPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(value) => { setSelectedCategory(value); setPage(1); }}
      />

      {loading ? (
        <CardSkeleton count={8} />
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
          <HiOutlinePhotograph className="text-6xl mb-4" />
          <p className="text-lg font-medium">Aucune photo trouvée</p>
          <p className="text-sm">Essayez de modifier vos filtres ou revenez plus tard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <MediaCard key={photo.id} media={photo} onClick={() => navigate(`/photos/${photo.id}`)} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={pagination?.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
