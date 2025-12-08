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
        const collectionEntry = collection.find(c => c.brainrotId === brainrot.id)
        const isOwned = !!collectionEntry

        return (
          <BrainrotCard
            key={brainrot.id}
            brainrot={brainrot}
            isOwned={isOwned}
            collectionEntry={collectionEntry}
            account={account}
            onToggleOwned={() => onToggleOwned(brainrot.id)}
            onUpdate={(updates) => onUpdateBrainrot(brainrot.id, updates)}
          />
        )
      })}
    </div>
  )
}

