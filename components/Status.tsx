export function Status({
  busy,
  error,
  message,
  retry,
}: {
  busy?: boolean;
  error?: string;
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="status" aria-live="polite" aria-busy={busy}>
      {error ? (
        <>
          <p role="alert" className="error">
            {error}
          </p>
          {retry && (
            <button className="button" onClick={retry}>
              読み込みを再試行
            </button>
          )}
        </>
      ) : (
        <p>
          {busy
            ? "処理エンジンを読み込んでいます。初回は少し時間がかかります。"
            : message}
        </p>
      )}
    </div>
  );
}
