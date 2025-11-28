const QuantitySelector = ({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled = false,
  onDelete = null,
  deleteLabel = "Eliminar",
  stock = null,
  existing = 0,
}) => {
  const remaining =
    typeof stock === "number"
      ? Math.max(0, Number(stock) - (Number(existing) || 0))
      : null;
  const effectiveMax = remaining == null ? max : Math.max(1, remaining);

  const dec = () => onChange(Math.max(min, (Number(value) || 0) - 1));
  const inc = () => onChange(Math.min(effectiveMax, (Number(value) || 0) + 1));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={dec}
        disabled={disabled || Number(value) <= min}
        aria-label="Disminuir cantidad"
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed w-9 h-9 text-sm focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
      >
        <span className="material-symbols-rounded text-base">remove</span>
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={effectiveMax}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onChange("");
          const n = Math.trunc(Number(v) || 0);
          if (n < min) onChange(min);
          else if (n > effectiveMax) onChange(effectiveMax);
          else onChange(n);
        }}
        onBlur={() => {
          let n = Number(value) || min;
          if (!Number.isInteger(n)) n = Math.trunc(n);
          if (n < min) n = min;
          if (n > effectiveMax) n = effectiveMax;
          onChange(n);
        }}
        disabled={disabled}
        aria-label="Cantidad"
        className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-center text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={inc}
        disabled={disabled || Number(value) >= effectiveMax}
        aria-label="Aumentar cantidad"
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed w-9 h-9 text-sm focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
      >
        <span className="material-symbols-rounded text-base">add</span>
      </button>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          aria-label={deleteLabel}
          className="inline-flex items-center justify-center rounded-md border border-red-300 text-red-600 bg-white hover:bg-red-50 w-9 h-9 text-sm focus:outline-none focus-visible:ring focus-visible:ring-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-rounded text-base">delete</span>
        </button>
      )}
    </div>
  );
};

export default QuantitySelector;
