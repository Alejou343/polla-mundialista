/**
 * Convierte un display_name en un email sintético `slug@familiauribe.com`.
 * Supabase Auth exige un email; los usuarios reales solo conocen su nombre.
 */
export function emailFromDisplayName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
  if (!slug) throw new Error("Nombre inválido para email");
  return `${slug}@familiauribe.com`;
}
