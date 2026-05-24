---
name: prueba-puntuacion
description: Use when the user asks to write tests for the scoring algorithm, add test cases for points calculation, or verify edge cases in scoring. Triggers on "test scoring", "prueba de puntos", "casos de puntuación", "validar puntos".
---

# Generar tests del algoritmo de puntuación

Cuando se necesite agregar o validar tests del scorer, sigue esta estructura.

## Ubicación

`tests/scoring.test.ts`

## Framework

Vitest. Configurado en `vitest.config.ts`. Corre con `pnpm test`.

## Plantilla base

```typescript
import { describe, it, expect } from 'vitest';
import { calculatePoints } from '@/lib/scoring';

describe('calculatePoints', () => {
  describe('marcador exacto (3 puntos)', () => {
    const cases: Array<[number, number, number, number]> = [
      [2, 1, 2, 1],
      [0, 0, 0, 0],
      [3, 3, 3, 3],
      [5, 0, 5, 0],
    ];
    it.each(cases)('predicción %i-%i, real %i-%i', (ph, pa, rh, ra) => {
      expect(calculatePoints(ph, pa, rh, ra)).toBe(3);
    });
  });

  describe('resultado correcto (1 punto)', () => {
    const cases: Array<[number, number, number, number, string]> = [
      [2, 1, 3, 2, 'mismo ganador local, marcador distinto'],
      [1, 2, 0, 3, 'mismo ganador visitante, marcador distinto'],
      [1, 1, 2, 2, 'empate, marcador distinto'],
      [3, 0, 1, 0, 'mismo ganador local con diferencias muy distintas'],
    ];
    it.each(cases)('predicción %i-%i, real %i-%i: %s', (ph, pa, rh, ra) => {
      expect(calculatePoints(ph, pa, rh, ra)).toBe(1);
    });
  });

  describe('resultado incorrecto (0 puntos)', () => {
    const cases: Array<[number, number, number, number, string]> = [
      [2, 1, 1, 2, 'ganador opuesto'],
      [1, 1, 2, 1, 'predijo empate, ganó local'],
      [1, 1, 1, 2, 'predijo empate, ganó visitante'],
      [2, 0, 0, 0, 'predijo victoria local, fue empate'],
      [0, 2, 0, 0, 'predijo victoria visitante, fue empate'],
    ];
    it.each(cases)('predicción %i-%i, real %i-%i: %s', (ph, pa, rh, ra) => {
      expect(calculatePoints(ph, pa, rh, ra)).toBe(0);
    });
  });

  describe('invariantes', () => {
    it('es idempotente: misma entrada, misma salida', () => {
      const a = calculatePoints(2, 1, 2, 1);
      const b = calculatePoints(2, 1, 2, 1);
      expect(a).toBe(b);
    });

    it('retorna solo 0, 1 o 3', () => {
      const all = new Set<number>();
      for (let ph = 0; ph <= 5; ph++) {
        for (let pa = 0; pa <= 5; pa++) {
          for (let rh = 0; rh <= 5; rh++) {
            for (let ra = 0; ra <= 5; ra++) {
              all.add(calculatePoints(ph, pa, rh, ra));
            }
          }
        }
      }
      expect([...all].sort()).toEqual([0, 1, 3]);
    });

    it('no devuelve 2 nunca', () => {
      for (let ph = 0; ph <= 10; ph++) {
        for (let pa = 0; pa <= 10; pa++) {
          for (let rh = 0; rh <= 10; rh++) {
            for (let ra = 0; ra <= 10; ra++) {
              expect(calculatePoints(ph, pa, rh, ra)).not.toBe(2);
            }
          }
        }
      }
    });
  });

  describe('escenarios reales del Mundial', () => {
    it('un 7-1 acertado da 3 puntos (sí, pasó en Brasil 2014)', () => {
      expect(calculatePoints(7, 1, 7, 1)).toBe(3);
    });

    it('un partido decidido en penales con empate al 90 cuenta como empate', () => {
      // Si en knockout el resultado fue 1-1 al minuto 90 y se decidió en penales,
      // el scorer recibe (1, 1). Una apuesta de 2-2 da 1 punto (acertó empate).
      expect(calculatePoints(2, 2, 1, 1)).toBe(1);
    });
  });
});
```

## Reglas para agregar tests

1. **Cualquier cambio al algoritmo requiere test nuevo o modificado**. Sin excepciones.
2. **Cada caso debe ser determinista**. No usar `Math.random()`, no usar `Date.now()`.
3. **Nombres descriptivos en español**. Los reportes de Vitest los lee el equipo.
4. **Agrupa por descripción del resultado esperado**: `describe('X puntos')`.
5. **Casos de borde explícitos**: 0-0, goleadas, marcadores idénticos pero perspectivas opuestas.

## Casos que NUNCA deben pasar test

Si alguno de estos tests pasa, hay un bug:

- `calculatePoints(2, 1, 2, 1) === 1` (debería ser 3)
- `calculatePoints(2, 1, 1, 2) === 1` (debería ser 0)
- `calculatePoints(0, 0, 0, 0) === 0` (debería ser 3)
- Retorno tipo `2`

## Output

Cuando agregues tests, corre `pnpm test` y muestra:
- Total de tests
- Cuántos pasaron
- Si algún test rojo, muestra el diff esperado vs real
