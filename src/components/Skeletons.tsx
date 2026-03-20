export function SkeletonCard() {
  return (
    <div className="bg-white p-8 rounded-xl border border-[#c3c6ce]/10 shadow-[0_12px_40px_rgba(0,21,42,0.04)] animate-pulse flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-[#e7e8e9] rounded-lg" />
        <div className="w-16 h-4 bg-[#e7e8e9] rounded" />
      </div>
      <div className="space-y-3">
        <div className="w-32 h-3 bg-[#e7e8e9] rounded" />
        <div className="w-40 h-8 bg-[#e7e8e9] rounded" />
        <div className="w-48 h-3 bg-[#e7e8e9] rounded mt-4" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between animate-pulse">
      <div className="flex gap-6 items-center">
        <div className="w-14 h-14 bg-[#e7e8e9] rounded-lg" />
        <div className="space-y-2">
          <div className="w-36 h-4 bg-[#e7e8e9] rounded" />
          <div className="w-48 h-3 bg-[#e7e8e9] rounded" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <div className="w-20 h-4 bg-[#e7e8e9] rounded ml-auto" />
        <div className="w-14 h-3 bg-[#e7e8e9] rounded ml-auto" />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-[#00152a] p-8 rounded-xl animate-pulse">
      <div className="w-40 h-3 bg-white/10 rounded mb-8" />
      <div className="flex items-end justify-between h-32 gap-3 mb-6">
        <div className="w-full bg-white/10 rounded-t h-3/4" />
        <div className="w-full bg-white/10 rounded-t h-full" />
        <div className="w-full bg-white/10 rounded-t h-1/2" />
        <div className="w-full bg-white/10 rounded-t h-1/4" />
      </div>
      <div className="flex justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-6 h-2 bg-white/10 rounded" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonAudit() {
  return (
    <div className="bg-[#f3f4f5] p-8 rounded-xl animate-pulse flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-[#e7e8e9] rounded" />
        <div className="w-36 h-4 bg-[#e7e8e9] rounded" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="w-10 h-10 bg-[#e7e8e9] rounded" />
            <div className="space-y-2">
              <div className="w-28 h-3 bg-[#e7e8e9] rounded" />
              <div className="w-36 h-2 bg-[#e7e8e9] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
