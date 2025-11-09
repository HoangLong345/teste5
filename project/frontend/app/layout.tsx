import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Wedchat",
  description: "Ứng dụng chat realtime với Go WebSocket và Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
