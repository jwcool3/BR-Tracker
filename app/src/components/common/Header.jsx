import DataManager from './DataManager'

/**
 * Header Component - Top navigation bar
 * Shows current view and provides navigation + data management
 */
export default function Header({ 
  currentView, 
  selectedAccount, 
  onNavigate,
  accounts,
  collections,
  onImportData,
  onClearAllData,
  hasVerificationReport
}) {
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

              <button
                onClick={() => onNavigate.viewOrganization()}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'organization'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                ✨ Organize
              </button>

              {hasVerificationReport && (
                <button
                  onClick={() => onNavigate.viewVerification()}
                  className={`px-4 py-2 rounded-lg transition-colors relative ${
                    currentView === 'verification'
                      ? 'bg-yellow-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    ⚠️ Verify Data
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </span>
                </button>
              )}
            </nav>

            {currentView === 'detail' && selectedAccount && (
              <span className="text-gray-400 text-sm">
                → {selectedAccount.name}
              </span>
            )}
          </div>

          {/* Data Management Button */}
          <DataManager
            accounts={accounts}
            collections={collections}
            onImport={onImportData}
            onClearAll={onClearAllData}
          />
        </div>
      </div>
    </header>
  )
}

