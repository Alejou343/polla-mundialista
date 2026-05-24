export function DateGroupHeader({ isoDate }: { isoDate: string }) {
  const d = new Date(isoDate);
  const label = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return (
    <h2 className="mt-6 mb-2 font-headline text-2xl uppercase tracking-wide text-carbon/80">
      {label}
    </h2>
  );
}
