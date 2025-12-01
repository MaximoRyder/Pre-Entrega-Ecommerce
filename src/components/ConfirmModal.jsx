import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "¿Deseas eliminar este producto de tu carrito? Esta acción no se puede deshacer.",
  cancelText = "Cancelar",
  confirmText = "Eliminar",
  confirmDisabled = false,
  confirmLoading = false,
}) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-sm md:max-w-md rounded-xl bg-surface border border-border shadow-lg p-6 animate-[fadeIn_.18s_ease-out]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold tracking-tight text-main">
            {title}
          </h3>
        </div>
        <div className="mb-6 text-sm text-sub leading-relaxed">
          <p>{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-border bg-surface hover:bg-surface-hover text-sm font-medium px-4 py-2 text-sub transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary-500/40"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => onConfirm && onConfirm()}
            disabled={confirmDisabled || confirmLoading}
            className={
              "inline-flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 transition-colors focus:outline-none focus-visible:ring focus-visible:ring-red-500/50 " +
              (confirmDisabled || confirmLoading
                ? "opacity-60 cursor-not-allowed"
                : "")
            }
          >
            {confirmLoading ? (
              <span className="inline-flex items-center gap-2">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ConfirmModal;
