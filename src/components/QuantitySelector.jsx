import "../styles/QuantitySelector.css";

const QuantitySelector = ({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled = false,
  onDelete = null,
  deleteLabel = "Eliminar",
}) => {
  const dec = () => onChange(Math.max(min, (Number(value) || 0) - 1));
  const inc = () => onChange(Math.min(max, (Number(value) || 0) + 1));

  return (
    <div className="qs-controls">
      <button
        className="btn"
        data-variant="secondary"
        data-visual="outline"
        data-size="sm"
        data-shape="square"
        onClick={dec}
        disabled={disabled || Number(value) <= min}
        aria-label="Disminuir cantidad"
      >
        <span className="material-symbols-rounded">remove</span>
      </button>
      <input
        type="number"
        className="qs-input"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return onChange("");
          const n = Math.trunc(Number(v) || 0);
          if (n < min) onChange(min);
          else if (n > max) onChange(max);
          else onChange(n);
        }}
        onBlur={() => {
          let n = Number(value) || min;
          if (!Number.isInteger(n)) n = Math.trunc(n);
          if (n < min) n = min;
          if (n > max) n = max;
          onChange(n);
        }}
        disabled={disabled}
        aria-label="Cantidad"
      />
      <button
        className="btn"
        data-variant="secondary"
        data-visual="outline"
        data-size="sm"
        data-shape="square"
        onClick={inc}
        disabled={disabled || Number(value) >= max}
        aria-label="Aumentar cantidad"
      >
        <span className="material-symbols-rounded">add</span>
      </button>
      {onDelete && (
        <button
          className="btn"
          data-variant="error"
          data-visual="outline"
          data-size="sm"
          data-shape="square"
          onClick={onDelete}
          disabled={disabled}
          aria-label={deleteLabel}
        >
          <span className="material-symbols-rounded">delete</span>
        </button>
      )}
    </div>
  );
};

export default QuantitySelector;
