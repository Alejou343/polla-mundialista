import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-screen-sm items-center justify-center px-4 py-10">
      <Loader size="lg" label="Cargando ranking" />
    </div>
  );
}
