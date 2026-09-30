const StatusBadge = ({
  active,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo",
}) => {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
};

export default StatusBadge;
