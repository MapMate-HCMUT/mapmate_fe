function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <h1 className="text-xl font-bold tracking-tight">MapMate</h1>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-card shadow-card p-8 text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">🚀 MapMate — Bạn đồng hành di chuyển thông minh</h2>
          <p className="text-neutral-500">Dự án đang trong giai đoạn phát triển...</p>
          <div className="mt-6 flex justify-center gap-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-primary-100 text-primary-700 text-sm font-medium">🗺️ Goong Maps</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-info-100 text-info-700 text-sm font-medium">🤖 AI Planner</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-danger-100 text-danger-700 text-sm font-medium">🌊 Flood Alert</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-accent-100 text-accent-700 text-sm font-medium">🏆 Gamification</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
