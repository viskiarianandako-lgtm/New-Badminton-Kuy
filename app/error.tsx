"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4">
      <h2 className="text-xl font-extrabold text-on-surface">Terjadi kesalahan</h2>
      <p className="max-w-md text-center text-sm text-muted">
        Aplikasi mengalami kendala. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="rounded-pill bg-brand px-6 py-3 text-base font-bold text-on-brand"
      >
        Coba Lagi
      </button>
    </div>
  );
}
