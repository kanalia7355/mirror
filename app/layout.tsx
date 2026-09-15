import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-sans-jp/400.css";
import "@fontsource/ibm-plex-sans-jp/700.css";
import "./globals.css";
import { Header, Footer } from "@/components/Header";
export const metadata: Metadata = {
  title: "Invisible Mirror",
  description: "そこにいるのに、見えない。 ブラウザーで体験する画像処理展示。",
};
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link button" href="#main">
          本文へ移動
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
