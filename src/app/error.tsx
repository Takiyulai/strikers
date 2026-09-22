"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-xl font-semibold text-red-400">
          Quelque chose s&apos;est mal passé
        </h2>
        <p className="text-gray-300 text-sm break-words">
          {error.message || "Erreur inattendue."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium text-white"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
