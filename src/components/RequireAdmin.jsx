import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireAdmin = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user || user.role !== "admin")
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default RequireAdmin;
