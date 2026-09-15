import Link from "next/link";
import { IntroArt } from "./IntroArt";
export function StartScreen() {
  return (
    <>
      <section className="hero">
        <div className="split">
          <div>
            <h1>
              そこにいるのに、
              <br />
              見えない。
            </h1>
            <p>
              人物だけを見つけて、背景に置き換える。
              <br />
              カメラの前で「透明人間」を体験しよう。
            </p>
            <Link className="button primary mt-6" href="/experience">
              透明人間になってみる
            </Link>
          </div>
          <figure className="hero-visual">
            <IntroArt kind="invisible-mirror" />
            <figcaption className="figure-caption">
              人物領域だけを置き換える仕組みの説明図
            </figcaption>
          </figure>
        </div>
        <ol className="steps mt-10">
          <li>
            <strong>1. 固定する</strong>
            <p>カメラの位置を決める。</p>
          </li>
          <li>
            <strong>2. 撮影する</strong>
            <p>人のいない背景を覚える。</p>
          </li>
          <li>
            <strong>3. 戻ってくる</strong>
            <p>自分の姿が消えていく。</p>
          </li>
        </ol>
      </section>
    </>
  );
}
