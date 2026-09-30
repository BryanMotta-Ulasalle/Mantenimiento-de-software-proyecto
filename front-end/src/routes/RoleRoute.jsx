import { Navigate } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import useAuth from "../hooks/useAuth";

const RoleRoute = ({ children, allow }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingState message="Cargando sesion..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user?.role?.name)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
