import { XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const AdminEntityModal = ({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitLabel = "Guardar",
  loading = false,
  loadingLabel = "Guardando...",
}) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-xl bg-surface shadow-lg ring-1 ring-border p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-main">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md hover:bg-surface-hover w-8 h-8 text-sub focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
          className="flex flex-col gap-4"
        >
          {children}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-surface hover:bg-surface-hover text-sub focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={
                "inline-flex items-center gap-2 rounded-md bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40 " +
                (loading ? "cursor-not-allowed" : "")
              }
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>{loadingLabel}</span>
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AdminEntityModal;
