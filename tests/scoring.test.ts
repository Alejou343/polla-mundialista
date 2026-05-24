import { describe, it, expect } from "vitest";
import { calculatePoints } from "@/lib/scoring";

describe("calculatePoints", () => {
  describe("marcador exacto (3 puntos)", () => {
    const cases: Array<[number, number, number, number]> = [
      [2, 1, 2, 1],
      [0, 0, 0, 0],
      [3, 3, 3, 3],
      [5, 0, 5, 0],
    ];
    it.each(cases)("predicción %i-%i, real %i-%i", (ph, pa, rh, ra) => {
      expect(calculatePoints(ph, pa, rh, ra)).toBe(3);
    });
  });

  describe("resultado correcto (1 punto)", () => {
    const cases: Array<[number, number, number, number, string]> = [
      [2, 1, 3, 2, "mismo ganador local, marcador distinto"],
      [1, 2, 0, 3, "mismo ganador visitante, marcador distinto"],
      [1, 1, 2, 2, "empate, marcador distinto"],
      [3, 0, 1, 0, "mismo ganador local con diferencias muy distintas"],
      [0, 0, 1, 1, "predijo empate 0-0, fue empate 1-1"],
    ];
    it.each(cases)(
      "predicción %i-%i, real %i-%i: %s",
      (ph, pa, rh, ra) => {
        expect(calculatePoints(ph, pa, rh, ra)).toBe(1);
      },
    );
  });

  describe("resultado incorrecto (0 puntos)", () => {
    const cases: Array<[number, number, number, number, string]> = [
      [2, 1, 1, 2, "ganador opuesto"],
      [1, 1, 2, 1, "predijo empate, ganó local"],
      [1, 1, 1, 2, "predijo empate, ganó visitante"],
      [2, 0, 0, 0, "predijo victoria local, fue empate"],
      [0, 2, 0, 0, "predijo victoria visitante, fue empate"],
      [0, 0, 1, 0, "predijo empate, fue victoria local mínima"],
    ];
    it.each(cases)(
      "predicción %i-%i, real %i-%i: %s",
      (ph, pa, rh, ra) => {
        expect(calculatePoints(ph, pa, rh, ra)).toBe(0);
      },
    );
  });

  describe("invariantes", () => {
    it("es idempotente: misma entrada, misma salida", () => {
      const a = calculatePoints(2, 1, 2, 1);
      const b = calculatePoints(2, 1, 2, 1);
      expect(a).toBe(b);
    });

    it("retorna solo 0, 1 o 3", () => {
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

    it("nunca devuelve 2", () => {
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

    it("es simétrico al invertir local/visitante en ambos lados", () => {
      // Si invertimos local↔visitante en predicción Y en real, el puntaje no cambia
      for (let ph = 0; ph <= 4; ph++) {
        for (let pa = 0; pa <= 4; pa++) {
          for (let rh = 0; rh <= 4; rh++) {
            for (let ra = 0; ra <= 4; ra++) {
              expect(calculatePoints(ph, pa, rh, ra)).toBe(
                calculatePoints(pa, ph, ra, rh),
              );
            }
          }
        }
      }
    });
  });

  describe("escenarios reales del Mundial", () => {
    it("un 7-1 acertado da 3 puntos (Alemania-Brasil 2014)", () => {
      expect(calculatePoints(7, 1, 7, 1)).toBe(3);
    });

    it("partido decidido en penales con empate al 90 cuenta como empate", () => {
      expect(calculatePoints(2, 2, 1, 1)).toBe(1);
    });

    it("una goleada predicha contra una victoria mínima sigue siendo 1 punto", () => {
      expect(calculatePoints(5, 0, 1, 0)).toBe(1);
    });
  });
});
