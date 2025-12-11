import BrainrotCard from '../brainrot/BrainrotCard'

/**
 * Brainrot Grid - Grid layout of all brainrots
 */
export default function BrainrotGrid({
  brainrots,
  collection,
  account,
  onToggleOwned,
  onUpdateBrainrot
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {brainrots.map(brainrot => {
        // Get all entries for this brainrot (for quantity)
        const allEntries = collection.filter(c => c.brainrotId === brainrot.id)
        const collectionEntry = allEntries[0] // Use first for configuration
        const isOwned = allEntries.length > 0
        const quantity = allEntries.length

        return (
          <BrainrotCard
            key={brainrot.id}
            brainrot={brainrot}
            isOwned={isOwned}
            collectionEntry={collectionEntry}
            quantity={quantity}
            account={account}
            onToggleOwned={(qty) => onToggleOwned(brainrot.id, qty)}
            onUpdate={(updates) => onUpdateBrainrot(brainrot.id, updates)}
          />
        )
      })}
    </div>
  )
}

