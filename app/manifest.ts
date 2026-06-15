import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Polla Familiar 26",
    short_name: "Polla 26",
    description:
      "Predice los marcadores del Mundial 2026 con la familia. Arma tus marcadores, suma puntos y pelea la tabla.",
    start_url: "/matches",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    lang: "es",
    categories: ["sports", "entertainment", "social"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
