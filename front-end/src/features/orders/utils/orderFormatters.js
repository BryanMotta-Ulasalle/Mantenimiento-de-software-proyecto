export const formatOrderDate = (date) => {
  if (!date) return "Fecha no disponible";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Fecha no disponible";

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};
