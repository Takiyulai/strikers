"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-[#0f1a2e] text-white p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
          <p className="text-gray-300 text-sm break-words">
            {error.message || "Erreur inattendue."}
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
