import { CopaView } from "./copa-view";

export const dynamic = "force-dynamic";

/**
 * MAQUETA (v2) del "Sorteo de campeón" — vista unificada con datos MOCK.
 * Dos pestañas (Tablero / Bracket) y un control de demo que maneja ambas.
 * Aún no cableada a la BD: cuando aprobemos el look, se reemplaza el mock por
 * la vista draft_team_status y se quita el control de demo.
 */
export default function CopaPage() {
  return <CopaView />;
}
