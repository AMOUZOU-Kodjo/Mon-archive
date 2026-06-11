import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineDocumentText } from 'react-icons/hi';
import api from '../utils/api';
import MediaCard from '../components/MediaCard';
import HeroStats from '../components/HeroStats';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { CardSkeleton } from '../components/SkeletonLoader';

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: 'document', page, limit: 9 });
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('categorie', selectedCategory);
    Promise.all([
      api.get(`/medias?${params}`),
      api.get('/medias/stats'),
    ])
      .then(([medias, statsRes]) => {
        setDocuments(medias.data.data);
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
        label="Documents"
        icon={HiOutlineDocumentText}
        color="info"
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={(value) => { setSearchTerm(value); setPage(1); }}
        selectedCategory={selectedCategory}
        onCategoryChange={(value) => { setSelectedCategory(value); setPage(1); }}
      />

      {loading ? (
        <CardSkeleton count={6} />
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-base-content/40">
          <HiOutlineDocumentText className="text-6xl mb-4" />
          <p className="text-lg font-medium">Aucun document trouvé</p>
          <p className="text-sm">Essayez de modifier vos filtres ou revenez plus tard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <MediaCard key={doc.id} media={doc} onClick={() => navigate(`/documents/${doc.id}`)} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={pagination?.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
