export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      <div className="h-8 w-24 animate-pulse rounded bg-carbon/10" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    </div>
  );
}
