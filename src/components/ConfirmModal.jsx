import { useEffect } from "react";
import { createPortal } from "react-dom";
import "../styles/ConfirmModal.css";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "¿Deseas eliminar este producto de tu carrito? Esta acción no se puede deshacer.",
  cancelText = "Cancelar",
  confirmText = "Eliminar",
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
      className="confirm-overlay"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div className="confirm-modal">
        <div className="confirm-header">
          <h3>{title}</h3>
        </div>
        <div className="confirm-body">
          <p>{message}</p>
        </div>
        <div className="confirm-actions">
          <button
            className="btn"
            data-variant="secondary"
            data-visual="outline"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="btn"
            data-variant="error"
            data-visual="solid"
            onClick={() => {
              onConfirm && onConfirm();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ConfirmModal;
