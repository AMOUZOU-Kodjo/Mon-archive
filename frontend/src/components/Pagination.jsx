import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-ghost btn-sm btn-square disabled:opacity-30"
      >
        <HiOutlineChevronLeft className="text-lg" />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="btn btn-ghost btn-sm btn-square">1</button>
          {start > 2 && <span className="text-xs text-base-content/30 px-1">...</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`btn btn-sm min-w-[2.5rem] ${p === page ? 'btn-primary' : 'btn-ghost'}`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-xs text-base-content/30 px-1">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="btn btn-ghost btn-sm btn-square">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-ghost btn-sm btn-square disabled:opacity-30"
      >
        <HiOutlineChevronRight className="text-lg" />
      </button>
    </div>
  );
}
