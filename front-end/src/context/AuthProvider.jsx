import { useEffect, useState } from "react";
import {
  clearTokens,
  saveTokens,
  setSessionChangeHandler,
} from "../api/client";
import { AuthContext } from "./AuthContext";
import {
  getCurrentUser,
  login as loginRequest,
} from "../features/Autentication/api/AuthApi";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("access"),
  );
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem("refresh"),
  );
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role?.name === "Admin";
  const isEmployee = user?.role?.name === "Employee";
  const isCustomer = user?.role?.name === "Customer";

  const clearSession = () => {
    clearTokens();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const login = async (credentials) => {
    setIsLoading(true);

    try {
      const tokens = await loginRequest(credentials);
      saveTokens(tokens);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);

      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearSession();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  useEffect(() => {
    const unsubscribe = setSessionChangeHandler((event) => {
      if (event.type === "expired") {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        return;
      }

      if (event.type === "refreshed") {
        setAccessToken(event.access);
        setRefreshToken(event.refresh);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isActive = true;

    const restoreSession = async () => {
      const storedAccess = localStorage.getItem("access");
      const storedRefresh = localStorage.getItem("refresh");

      if (!storedAccess && !storedRefresh) {
        if (isActive) setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isActive) setUser(currentUser);
      } catch {
        clearTokens();
        if (isActive) {
          setAccessToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const value = {
    user,
    setUser,
    updateUser,
    accessToken,
    refreshToken,
    isLoading,
    setIsLoading,
    isAuthenticated,
    isAdmin,
    isCustomer,
    isEmployee,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
