/**
 * Squelette de chargement (skeleton loader).
 * Affiche des blocs animés pendant le chargement des données.
 */
export function CardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card bg-base-100 shadow-sm animate-pulse">
          <div className="h-48 bg-base-300 rounded-t-2xl" />
          <div className="card-body p-4 space-y-2">
            <div className="h-4 bg-base-300 rounded w-3/4" />
            <div className="h-3 bg-base-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="stat bg-base-100 rounded-xl animate-pulse">
          <div className="h-4 bg-base-300 rounded w-20 mb-2" />
          <div className="h-8 bg-base-300 rounded w-16 mb-1" />
          <div className="h-3 bg-base-300 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-base-300 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
