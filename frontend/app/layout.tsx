import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "otzovik — поиск площадок для отзывов",
  description: "Найдите лучшие сайты для размещения отзывов о любом продукте или услуге",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-bg-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
