import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 py-12 text-center">
      <span className="text-5xl" aria-hidden>
        ⚽
      </span>
      <h1 className="mt-3 font-headline text-4xl uppercase tracking-wide text-cesped">
        Página no encontrada
      </h1>
      <p className="mt-2 text-sm text-carbon/60">La dirección que buscas no existe o se movió.</p>
      <Link href="/" className="btn-primary mt-6">
        Volver al inicio
      </Link>
    </main>
  );
}
