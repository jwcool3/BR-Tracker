import { ArrowLeft } from 'lucide-react'

/**
 * Detail Header - Top section of account detail view
 * Shows account name, back button, and rebirth info
 */
export default function DetailHeader({ account, onBack, onUpdateAccount }) {
  return (
    <div className="mb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{account.name}</h1>
          {account.notes && (
            <p className="text-gray-400">{account.notes}</p>
          )}
          <div className="text-sm text-gray-500 mt-1">
            Rebirth Level: {account.rebirthLevel}
          </div>
        </div>
      </div>
    </div>
  )
}

