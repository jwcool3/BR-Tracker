import BrainrotCard from '../brainrot/BrainrotCard'

/**
 * Brainrot Grid - Grid layout of all brainrots
 */
export default function BrainrotGrid({
  brainrots,
  collection,
  account,
  accounts = [], // All accounts for transfer
  onToggleOwned,
  onUpdateBrainrot,
  onTransfer // Transfer function
}) {
  // Create array of cards to display
  // For owned brainrots: show one card per collection entry
  // For not-owned: show one card per brainrot
  const cards = []
  
  brainrots.forEach(brainrot => {
    const allEntries = collection.filter(c => c.brainrotId === brainrot.id)
    
    if (allEntries.length > 0) {
      // Show separate card for each owned copy
      allEntries.forEach((entry, index) => {
        cards.push({
          key: `${brainrot.id}-${index}`,
          brainrot,
          isOwned: true,
          collectionEntry: entry,
          collectionIndex: collection.indexOf(entry),
          copyNumber: index + 1,
          totalCopies: allEntries.length
        })
      })
    } else {
      // Show one card for not-owned brainrot
      cards.push({
        key: brainrot.id,
        brainrot,
        isOwned: false,
        collectionEntry: null,
        collectionIndex: -1,
        copyNumber: 0,
        totalCopies: 0
      })
    }
  })

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {cards.map(({ key, brainrot, isOwned, collectionEntry, collectionIndex, copyNumber, totalCopies }) => (
        <BrainrotCard
          key={key}
          brainrot={brainrot}
          isOwned={isOwned}
          collectionEntry={collectionEntry}
          collectionIndex={collectionIndex}
          copyNumber={copyNumber}
          totalCopies={totalCopies}
          account={account}
          accounts={accounts}
          onToggleOwned={(qty) => onToggleOwned(brainrot.id, qty)}
          onUpdate={(updates) => onUpdateBrainrot(brainrot.id, updates, collectionIndex)}
          onTransfer={onTransfer}
        />
      ))}
    </div>
  )
}

