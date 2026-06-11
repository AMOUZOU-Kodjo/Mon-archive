import { HiOutlineSearch } from 'react-icons/hi';

const categories = [
  { value: '', label: 'Tout' },
  { value: 'cours', label: 'Cours' },
  { value: 'révision', label: 'Révision' },
  { value: 'examen', label: 'Examen' },
  { value: 'exercice', label: 'Exercice' },
];

export default function FilterBar({ searchTerm, onSearchChange, selectedCategory, onCategoryChange, categories: customCategories }) {
  const cats = customCategories || categories;

  return (
    <div className="space-y-3">
      {/* Catégories */}
      {cats.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {cats.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange?.(cat.value)}
              className={`btn btn-sm rounded-full ${
                (selectedCategory || '') === cat.value
                  ? 'btn-primary'
                  : 'btn-ghost bg-base-200/50 hover:bg-base-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Recherche */}
      <div className="join w-full">
        <div className="join-item flex items-center pl-3 bg-base-100 border border-base-300 rounded-l-lg">
          <HiOutlineSearch className="text-base-content/40 text-lg" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par titre, description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="join-item input input-bordered flex-1 border-l-0 rounded-r-lg focus:outline-none"
        />
      </div>
    </div>
  );
}
