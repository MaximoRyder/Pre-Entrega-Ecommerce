import { useCallback, useState } from "react";
import ToastContext, {
  ToastContext as ToastContextNamed,
} from "./toastContextObj";

export { ToastContextNamed as ToastContext };

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    msg: "",
    visible: false,
    type: "success",
  });

  const showToast = useCallback((msg, ms = 1800, type = "success") => {
    if (!msg) return;
    if (typeof ms === "string") {
      type = ms;
      ms = 1800;
    }
    setToast({ msg, visible: true, type });
    setTimeout(
      () => setToast({ msg: "", visible: false, type: "success" }),
      ms
    );
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          className={[
            "fixed bottom-6 left-1/2 -translate-x-1/2",
            "w-[min(90vw,560px)]",
            "px-5 py-3 rounded-lg shadow-lg text-sm sm:text-base font-medium",
            "backdrop-blur-sm border flex items-start gap-3",
            "leading-relaxed",
            toast.type === "error" && "bg-red-600 text-white border-red-500",
            toast.type === "success" &&
              "bg-green-600 text-white border-green-500",
            toast.type === "info" && "bg-blue-600 text-white border-blue-500",
            toast.type === "warning" &&
              "bg-amber-500 text-white border-amber-400",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ zIndex: 999 }}
          role="status"
          aria-live="polite"
        >
          <p className="m-0 whitespace-pre-line break-words flex-1">
            {toast.msg}
          </p>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;
