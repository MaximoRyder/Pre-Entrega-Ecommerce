import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default RequireAuth;
