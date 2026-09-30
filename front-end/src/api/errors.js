const flattenMessages = (value) => {
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    return Object.values(value).map(flattenMessages).filter(Boolean).join(" ");
  }

  return "";
};

export const getApiErrorMessage = (
  error,
  fallback = "Ocurrio un error inesperado.",
) => {
  if (!error?.response) {
    return error?.message === "Network Error"
      ? "No se pudo conectar con el servidor."
      : error?.message || fallback;
  }

  const message = flattenMessages(error.response.data);
  return message || fallback;
};
