export default function LoadingPatterns() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-10">
          <div className="w-20 h-6 rounded-full bg-bg-card mb-4 animate-pulse" />
          <div className="w-64 h-10 bg-bg-card rounded-lg mb-3 animate-pulse" />
          <div className="w-96 h-5 bg-bg-card rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-bg-card border border-border animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
