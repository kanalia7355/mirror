import Link from "next/link";
export default function About() {
  return (
    <main id="main" className="about">
      <h1>Invisible Mirror の仕組み</h1>
      <section>
        <h2>何をしている？</h2>
        <p>
          MediaPipe Selfie
          Segmenterが各画素の人物らしさを推定します。しきい値の前後をなめらかに混ぜて、あらかじめ撮影した背景と現在の映像を合成します。
        </p>
        <p>
          Transparentは人物を背景に置換、Ghostは半透明、Outlineは境界を表示、Matrixは人物領域にデジタル模様を描きます。人物領域の面積は認識精度ではありません。
        </p>
      </section>
      <section>
        <h2>体験の準備</h2>
        <p>
          カメラを固定してください。背景撮影の3秒間は、全員がフレームの外に出ます。撮影後にカメラ・家具・照明を動かしたら、背景を撮り直してください。
        </p>
        <p>
          Chrome・EdgeのPC／タブレットで、HTTPSまたはlocalhostから開いてください。端末の性能や照明で処理速度・認識結果は変わります。
        </p>
      </section>
      <section>
        <h2>映像と記録の扱い</h2>
        <p>
          カメラ映像は画像処理のみに利用し、サーバーへの送信・保存は行いません。カメラ停止、別タブへの移動、ページ離脱時に撮影を停止します。背景画像はこのページのメモリ上に保持し、ページを閉じると破棄します。
        </p>
        <p>
          処理モデル・ライブラリ・フォントはアプリと同じ配信元から読み込みます。初回のアプリ表示には配信元への接続が必要です。
        </p>
      </section>
      <Link href="/experience" className="button primary">
        体験を始める
      </Link>
    </main>
  );
}
