const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  const buildPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
      return pages;
    }
    if (page >= totalPages - 3) {
      pages.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
      return pages;
    }
    pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return pages;
  };

  const pages = buildPages();

  return (
    <nav className="flex items-center justify-center gap-2 mt-3 flex-wrap">
      <button
        onClick={prev}
        disabled={page === 1}
        className={`inline-flex items-center px-3 py-1.5 rounded-md border text-sm ${
          page === 1
            ? "border-border text-muted bg-surface"
            : "border-border hover:bg-surface-hover text-main"
        }`}
        aria-label="Pagina anterior"
      >
        ‹
      </button>

      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border border-transparent bg-surface text-sm">
        <span className="text-xs text-sub">Página</span>
        <strong className="mx-1 text-main">{page}</strong>
        <span className="text-xs text-sub">de {totalPages}</span>
      </div>

      <div className="inline-flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-sm text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`inline-flex items-center justify-center w-8 h-8 text-sm rounded-md border ${
                p === page
                  ? "bg-primary-500 text-white border-primary-500"
                  : "bg-surface text-main border-border hover:bg-surface-hover"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={next}
        disabled={page === totalPages}
        className={`inline-flex items-center px-3 py-1.5 rounded-md border text-sm ${
          page === totalPages
            ? "border-border text-muted bg-surface"
            : "border-border hover:bg-surface-hover text-main"
        }`}
        aria-label="Pagina siguiente"
      >
        ›
      </button>
    </nav>
  );
};

export default Pagination;
