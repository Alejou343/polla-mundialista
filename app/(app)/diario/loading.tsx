export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-sm space-y-5 px-4 py-6">
      <div className="space-y-2">
        <div className="h-3 w-40 animate-pulse rounded bg-carbon/10" />
        <div className="h-10 w-56 animate-pulse rounded bg-carbon/10" />
        <div className="h-4 w-44 animate-pulse rounded bg-carbon/10" />
      </div>

      <div className="space-y-2">
        <div className="h-12 w-full animate-pulse rounded-xl bg-carbon/10" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-carbon/10" />
      </div>

      <div className="space-y-2">
        <div className="h-3 w-32 animate-pulse rounded bg-carbon/10" />
        <div className="h-48 w-full animate-pulse rounded-xl bg-carbon/10" />
      </div>
    </div>
  );
}
