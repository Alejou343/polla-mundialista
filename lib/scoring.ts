/**
 * Reglas de puntuación de la Polla Mundial 2026.
 *
 * - Marcador exacto: 3 puntos.
 * - Resultado correcto (mismo ganador o empate, marcador distinto): 1 punto.
 * - Resultado incorrecto: 0 puntos.
 *
 * Solo cuenta el resultado al minuto 90. Prórroga y penales son irrelevantes.
 */
export function calculatePoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number,
): number {
  if (predHome === realHome && predAway === realAway) return 3;
  const predOutcome = Math.sign(predHome - predAway);
  const realOutcome = Math.sign(realHome - realAway);
  if (predOutcome === realOutcome) return 1;
  return 0;
}
