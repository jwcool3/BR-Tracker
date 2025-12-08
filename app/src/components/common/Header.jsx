/**
 * Header Component - Top navigation bar
 * Shows current view and provides navigation
 */
export default function Header({ currentView, selectedAccount, onNavigate }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">🎮 Brainrot Tracker</h1>
            
            <nav className="hidden md:flex gap-2">
              <button
                onClick={() => onNavigate.backToDashboard()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                Dashboard
              </button>
              
              <button
                onClick={() => onNavigate.viewTotalCollection()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'collection'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                📊 Total Collection
              </button>
            </nav>

            {currentView === 'detail' && selectedAccount && (
              <span className="text-gray-400 text-sm">
                → {selectedAccount.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

