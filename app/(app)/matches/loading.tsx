export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      <div className="h-8 w-40 animate-pulse rounded bg-carbon/10" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-white" />
        ))}
      </div>
    </div>
  );
}
