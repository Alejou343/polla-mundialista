import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue, Oswald } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/components/RegisterSW";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-inter",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Polla Familiar 26",
  description:
    "Predice los marcadores del Mundial con tu familia. Arma tus marcadores, suma puntos y pelea la tabla.",
  applicationName: "Polla Familiar 26",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Polla 26",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d1117",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${bebas.variable} ${oswald.variable}`}>
      <body className="min-h-dvh bg-stadium font-body text-ivory antialiased">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
