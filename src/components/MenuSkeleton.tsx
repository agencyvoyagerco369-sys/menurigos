const MenuSkeleton = () => (
  <div className="space-y-3 px-4 pt-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 rounded-2xl bg-card p-4">
        <div className="skeleton h-16 w-16 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-5 w-16 rounded" />
        </div>
        <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
      </div>
    ))}
  </div>
);

export default MenuSkeleton;
