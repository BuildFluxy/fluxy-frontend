import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fluxy - Extracteur de Relevés Bancaires",
  description: "Solution d'extraction automatique de données bancaires avec IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-poppins bg-white text-slate-700">
        {children}
      </body>
    </html>
  );
}
