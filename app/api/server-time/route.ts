import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

/**
 * Hora autoritativa del servidor (UTC ISO). El cliente la usa para
 * calcular drift de su propio reloj y mostrar countdowns correctos
 * sin importar la TZ ni la manipulación del usuario.
 */
export async function GET() {
  return NextResponse.json(
    { iso: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
