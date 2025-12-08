import { ArrowLeft } from 'lucide-react'

/**
 * Collection Header - Top section of total collection view
 */
export default function CollectionHeader({ totalOwned, totalBrainrots, duplicates, totalIncome, onBack }) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-4">📊 Total Collection</h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Unique Owned</div>
          <div className="text-2xl font-bold">
            {totalOwned} <span className="text-sm text-gray-400">/ {totalBrainrots}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((totalOwned / totalBrainrots) * 100).toFixed(1)}% complete
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Missing</div>
          <div className="text-2xl font-bold text-red-400">{totalBrainrots - totalOwned}</div>
          <div className="text-xs text-gray-500 mt-1">Not owned anywhere</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Duplicates</div>
          <div className="text-2xl font-bold text-yellow-400">{duplicates}</div>
          <div className="text-xs text-gray-500 mt-1">On 2+ accounts</div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Income</div>
          <div className="text-2xl font-bold text-green-400">${totalIncome.toLocaleString()}/s</div>
          <div className="text-xs text-gray-500 mt-1">All accounts</div>
        </div>
      </div>
    </div>
  )
}

