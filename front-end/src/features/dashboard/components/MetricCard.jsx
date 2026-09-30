const MetricCard = ({ label, value, detail, icon: Icon }) => {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
          {detail && <p className="mt-2 text-xs text-stone-500">{detail}</p>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-golden/10 p-3 text-golden">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </article>
  );
};

export default MetricCard;
