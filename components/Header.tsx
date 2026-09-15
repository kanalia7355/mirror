import Link from "next/link";
export function Header() {
  return (
    <header className="header edge">
      <Link href="/" className="brand">
        Invisible Mirror
      </Link>
      <nav aria-label="メインナビゲーション">
        <Link href="/about">仕組みを知る</Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer statement">
      <strong>見えないところで、画像を理解する。</strong>
      <span>画像処理の体験展示 · 映像は端末内で処理</span>
      <Link href="/about">この展示について</Link>
    </footer>
  );
}
