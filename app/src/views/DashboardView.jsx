import AccountCard from '../components/dashboard/AccountCard'
import GlobalStats from '../components/dashboard/GlobalStats'
import AddAccountButton from '../components/dashboard/AddAccountButton'

/**
 * Dashboard View - Overview of all accounts
 * Shows account cards with slot usage and quick stats
 */
export default function DashboardView({ 
  accounts, 
  collections, 
  onViewAccount, 
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount 
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Accounts</h1>
          <p className="text-gray-400">Manage your Steal a Brainrot accounts</p>
        </div>
        <AddAccountButton onAdd={onAddAccount} />
      </div>

      {/* Account Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            collectionSize={collections[account.id]?.length || 0}
            onView={() => onViewAccount(account.id)}
            onEdit={(updates) => onUpdateAccount(account.id, updates)}
            onDelete={() => onDeleteAccount(account.id)}
          />
        ))}
      </div>

      {/* Global Stats */}
      <GlobalStats accounts={accounts} collections={collections} />
    </div>
  )
}

