export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg" aria-busy="true">
      <div className="h-10 w-72 bg-surface-container animate-pulse mb-space-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-3 h-96 bg-surface-container-lowest border border-outline-variant animate-pulse" />
        <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-80 bg-surface-container-lowest border border-outline-variant animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}