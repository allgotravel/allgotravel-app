export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <div className="max-w-sm space-y-4">
        <div className="text-6xl">✈️</div>
        <h1 className="text-2xl font-bold text-gray-800">Sin conexión / No connection</h1>
        <p className="text-gray-600">
          Estás en modo offline. Puedes seguir viendo las páginas que visitaste recientemente.
        </p>
        <p className="text-gray-500 text-sm">
          You&apos;re offline. You can still browse pages you visited recently.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Reintentar / Retry
        </button>
      </div>
    </div>
  )
}
