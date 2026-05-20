import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checklist Gia Dinh",
  description: "Todo list hang ngay cho hai vo chong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
