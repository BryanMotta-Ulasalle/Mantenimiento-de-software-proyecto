import { Navigate, useLocation } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Cargando sesion..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
};

export default PrivateRoute;
