import { useCallback, useState } from "react";
import "../styles/Toast.css";
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
        <div className={`app-toast ${toast.type || "success"}`}>
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContext;
