import { ArrowLeft, TrendingUp, Copy, XCircle, CheckCircle } from 'lucide-react'

/**
 * Collection Header - Top section of total collection view
 */
export default function CollectionHeader({ totalOwned, totalBrainrots, duplicates, totalIncome, onBack }) {
  const missing = totalBrainrots - totalOwned
  const completion = ((totalOwned / totalBrainrots) * 100).toFixed(1)
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">📊 Total Collection</h1>
          <p className="text-gray-400">Cross-account brainrot ownership tracker</p>
        </div>
        
        {/* Quick Stats Badge */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            <span>{totalOwned} owned</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-400" />
            <span>{missing} missing</span>
          </div>
          <div className="flex items-center gap-2">
            <Copy size={18} className="text-yellow-400" />
            <span>{duplicates} duplicates</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Unique Owned */}
        <div className="bg-gradient-to-br from-green-900/30 to-slate-800 rounded-lg p-4 border border-green-500/20">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
            <CheckCircle size={16} />
            <span>Unique Owned</span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {totalOwned} <span className="text-lg text-gray-400">/ {totalBrainrots}</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {completion}% collection complete
          </div>
        </div>

        {/* Missing */}
        <div className="bg-gradient-to-br from-red-900/30 to-slate-800 rounded-lg p-4 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
            <XCircle size={16} />
            <span>Missing</span>
          </div>
          <div className="text-3xl font-bold text-red-400 mb-1">{missing}</div>
          <div className="text-xs text-gray-400">
            Not owned on any account
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((missing / totalBrainrots) * 100).toFixed(1)}% to collect
          </div>
        </div>

        {/* Duplicates */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-slate-800 rounded-lg p-4 border border-yellow-500/20">
          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-2">
            <Copy size={16} />
            <span>Duplicates</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-1">{duplicates}</div>
          <div className="text-xs text-gray-400">
            Owned on 2+ accounts
          </div>
          {duplicates > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {((duplicates / totalOwned) * 100).toFixed(0)}% have duplicates
            </div>
          )}
        </div>

        {/* Total Income */}
        <div className="bg-gradient-to-br from-blue-900/30 to-slate-800 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
            <TrendingUp size={16} />
            <span>Total Income</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-1">
            ${formatNumber(totalIncome)}<span className="text-lg">/s</span>
          </div>
          <div className="text-xs text-gray-400">
            Combined from all accounts
          </div>
          {totalOwned > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              ${formatNumber(totalIncome / totalOwned)}/s avg
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Collection Progress</span>
          <span className="font-bold">{completion}%</span>
        </div>
        <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{totalOwned} collected</span>
          <span>{missing} remaining</span>
        </div>
      </div>
    </div>
  )
}

