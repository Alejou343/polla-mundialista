import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-screen-sm px-4 py-12 text-center">
      <h1 className="font-headline text-4xl text-carbon">Partido no encontrado</h1>
      <p className="mt-2 text-carbon/60">Quizás cambió de fecha o aún no se ha cargado.</p>
      <Link href="/matches" className="btn-primary mt-6 inline-flex">
        Volver a partidos
      </Link>
    </main>
  );
}
