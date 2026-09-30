import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_URL;

if (!configuredBaseUrl) {
  console.warn("VITE_API_URL no esta configurada.");
}

const baseURL = (configuredBaseUrl || "http://127.0.0.1:8000/api").replace(
  /\/+$/,
  "",
);

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest = null;
let sessionChangeHandler = null;

export const setSessionChangeHandler = (handler) => {
  sessionChangeHandler = handler;

  return () => {
    if (sessionChangeHandler === handler) {
      sessionChangeHandler = null;
    }
  };
};

export const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

const expireSession = () => {
  clearTokens();
  sessionChangeHandler?.({ type: "expired" });
};

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    expireSession();
    throw new Error("No hay refresh token disponible.");
  }

  if (!refreshRequest) {
    refreshRequest = axios
      .post(
        `${baseURL}/auth/refresh/`,
        { refresh },
        {
          headers: { "Content-Type": "application/json" },
        },
      )
      .then(({ data }) => {
        const tokens = {
          access: data.access,
          refresh: data.refresh || refresh,
        };

        saveTokens(tokens);
        sessionChangeHandler?.({ type: "refreshed", ...tokens });
        return tokens.access;
      })
      .catch((error) => {
        expireSession();
        throw error;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

apiClient.interceptors.request.use((config) => {
  if (config.withAuth === false) {
    delete config.headers.Authorization;
    return config;
  }

  const accessToken = localStorage.getItem("access");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh/");
    const mayUseSession =
      originalRequest?.withAuth === true ||
      Boolean(originalRequest?.headers?.Authorization);

    if (
      !originalRequest ||
      !isUnauthorized ||
      isRefreshRequest ||
      originalRequest._retry ||
      !mayUseSession
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default apiClient;
