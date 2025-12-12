/**
 * Floor Verification Screen - Review and confirm detected brainrots
 * Shows grid of detected cards with checkboxes and edit options
 */

import { useState } from 'react';
import { Check, X, Edit, AlertTriangle } from 'lucide-react';

export default function FloorVerificationScreen({ scanResult, account, onConfirmAll, onRetry }) {
  const [verifiedCards, setVerifiedCards] = useState(
    scanResult.successful.map(card => ({
      ...card,
      verified: card.confidence.overall >= 0.75, // Auto-check if 75%+ confidence
      edited: false
    }))
  );

  const [selectedCard, setSelectedCard] = useState(null);

  const handleToggleCard = (cardIndex) => {
    setVerifiedCards(prev => prev.map((card, i) => 
      i === cardIndex ? { ...card, verified: !card.verified } : card
    ));
  };

  const handleSelectAll = () => {
    setVerifiedCards(prev => prev.map(card => ({ ...card, verified: true })));
  };

  const handleDeselectAll = () => {
    setVerifiedCards(prev => prev.map(card => ({ ...card, verified: false })));
  };

  const handleAutoSelect = () => {
    // Only select cards with 80%+ confidence
    setVerifiedCards(prev => prev.map(card => ({
      ...card,
      verified: card.confidence.overall >= 0.80
    })));
  };

  const confirmedCount = verifiedCards.filter(c => c.verified).length;
  const avgConfidence = verifiedCards.reduce((sum, c) => 
    sum + (c.verified ? c.confidence.overall : 0), 0
  ) / (confirmedCount || 1);

  return (
    <div className="floor-verification-screen">
      {/* Header Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold">🎉 Floor Scan Complete!</h2>
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            ← Retake Photo
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Detected</div>
            <div className="text-2xl font-bold">{scanResult.totalCards}</div>
          </div>
          <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
            <div className="text-xs text-green-400 mb-1">Successful</div>
            <div className="text-2xl font-bold text-green-400">{scanResult.successfulExtractions}</div>
          </div>
          {scanResult.failedExtractions > 0 && (
            <div className="p-3 bg-red-600/10 border border-red-600/30 rounded-lg">
              <div className="text-xs text-red-400 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-400">{scanResult.failedExtractions}</div>
            </div>
          )}
          <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <div className="text-xs text-blue-400 mb-1">To Add</div>
            <div className="text-2xl font-bold text-blue-400">{confirmedCount}</div>
          </div>
        </div>

        {/* Avg Confidence */}
        {confirmedCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-400">Average Confidence:</span>
            <span className={`font-bold ${getConfidenceColor(avgConfidence)}`}>
              {Math.round(avgConfidence * 100)}%
            </span>
            <div className="flex-1 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${getConfidenceBgColor(avgConfidence)}`}
                style={{ width: `${avgConfidence * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleSelectAll}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Select All
        </button>
        <button
          onClick={handleDeselectAll}
          className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          Deselect All
        </button>
        <button
          onClick={handleAutoSelect}
          className="px-3 py-1.5 text-sm bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors"
        >
          Auto-Select (80%+)
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {verifiedCards.map((card, index) => (
          <div
            key={index}
            className={`
              relative p-4 rounded-lg border-2 transition-all cursor-pointer
              ${card.verified 
                ? 'border-blue-500 bg-blue-600/10' 
                : 'border-slate-700 bg-slate-800 opacity-60'
              }
              hover:scale-[1.02]
            `}
            onClick={() => handleToggleCard(index)}
          >
            {/* Checkbox */}
            <div className="absolute top-3 right-3">
              <div className={`
                w-6 h-6 rounded border-2 flex items-center justify-center transition-all
                ${card.verified 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-slate-600 bg-slate-700'
                }
              `}>
                {card.verified && <Check size={16} className="text-white" />}
              </div>
            </div>

            {/* Card Content */}
            <div className="flex gap-4">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                {card.imageData ? (
                  <img
                    src={card.imageData}
                    alt={card.matchedBrainrot?.name || 'Unknown'}
                    className="w-24 h-24 object-cover rounded-lg bg-slate-900"
                  />
                ) : card.matchedBrainrot?.image ? (
                  <img
                    src={`/${card.matchedBrainrot.image}`}
                    alt={card.matchedBrainrot.name}
                    className="w-24 h-24 object-contain rounded-lg bg-slate-900 p-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-slate-900 flex items-center justify-center text-4xl">
                    ❓
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg mb-1 truncate">
                  {card.matchedBrainrot?.name || 'Unknown'}
                </div>
                
                <div className="text-sm text-gray-400 mb-2">
                  {card.matchedBrainrot?.rarity && (
                    <span className="capitalize">{card.matchedBrainrot.rarity.replace('_', ' ')}</span>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-1 text-xs">
                  {/* Mutation (visual effect on character) */}
                  {card.parsedText.mutation && card.parsedText.mutation !== 'none' && (
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400">🔮 Mutation: {card.parsedText.mutation}</span>
                    </div>
                  )}
                  
                  {/* Traits/Modifiers (tiny icons at top) */}
                  {card.extractedData?.modifier_icons?.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-blue-400">🎨 Traits:</span>
                      <span className="text-gray-400">
                        {card.extractedData.modifier_icons.join(', ')}
                      </span>
                      {card.extractedData.has_visible_modifier_icons && (
                        <span className="text-green-400 text-[10px]">(icons detected)</span>
                      )}
                    </div>
                  )}
                  {card.extractedData?.has_visible_modifier_icons === false && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-[10px]">No modifier icons detected</span>
                    </div>
                  )}
                  
                  {/* Income */}
                  {card.parsedText.income && (
                    <div className="flex items-center gap-1">
                      <span className="text-green-400">💰 ${formatNumber(card.parsedText.income)}/s</span>
                    </div>
                  )}
                  
                  {/* Verification Warnings */}
                  {card.verification?.warnings && card.verification.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {card.verification.warnings.map((warning, idx) => {
                        // Special handling for missing modifier suggestions
                        if (warning.type === 'missing_modifier_detected') {
                          return (
                            <div 
                              key={idx}
                              className="text-[10px] px-2 py-1 rounded bg-blue-600/20 text-blue-300 border border-blue-500/30"
                            >
                              <div className="flex items-center gap-1">
                                <span>💡</span>
                                <span className="font-semibold">Smart Detection:</span>
                                <span>Likely has {warning.data.suggestedNames.join(', ')}</span>
                              </div>
                              {card.extractedData?.modifier_icons_auto_detected && (
                                <div className="mt-1 text-green-400 font-medium">
                                  ✅ Auto-applied (high confidence)
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        // Regular warnings
                        return (
                          <div 
                            key={idx}
                            className={`text-[10px] px-2 py-1 rounded ${
                              warning.severity === 'high' 
                                ? 'bg-red-600/20 text-red-400'
                                : warning.severity === 'medium'
                                  ? 'bg-yellow-600/20 text-yellow-400'
                                  : 'bg-gray-600/20 text-gray-400'
                            }`}
                          >
                            ⚠️ {warning.message}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Confidence Badge */}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${card.confidence.overall >= 0.9 
                      ? 'bg-green-600/20 text-green-400' 
                      : card.confidence.overall >= 0.75
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-red-600/20 text-red-400'
                    }
                  `}>
                    {Math.round(card.confidence.overall * 100)}% confidence
                  </span>
                  
                  {/* Extraction Method Badge */}
                  {card.metadata?.method === 'whole_floor_vision' && (
                    <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 rounded-full">
                      🖼️ Whole Floor AI
                    </span>
                  )}
                  {card.metadata?.method === 'vision' && (
                    <span className="text-[10px] px-2 py-0.5 bg-purple-600/20 text-purple-400 rounded-full">
                      🤖 AI Vision
                    </span>
                  )}
                  {card.metadata?.method === 'ocr' && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded-full">
                      📄 OCR
                    </span>
                  )}

                  {card.matchMethod === 'fuzzy' && (
                    <span className="ml-2 text-xs text-yellow-400" title="Name matched with fuzzy search">
                      ⚠️ Fuzzy match
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Failed Cards Section */}
      {scanResult.failed.length > 0 && (
        <div className="mb-6 p-4 bg-red-600/10 border border-red-600/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-red-400" />
            <h3 className="font-bold text-red-400">Failed Extractions ({scanResult.failed.length})</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">
            These cards couldn't be processed. You can add them manually later.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {scanResult.failed.map((failedCard, index) => (
              <div key={index} className="relative">
                {failedCard.imageData && (
                  <img
                    src={failedCard.imageData}
                    alt="Failed card"
                    className="w-full h-24 object-cover rounded-lg bg-slate-900 opacity-50"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <X size={24} className="text-red-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation */}
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div>
          <div className="font-bold mb-1">
            Ready to add {confirmedCount} brainrot{confirmedCount !== 1 ? 's' : ''} to {account.name}?
          </div>
          <div className="text-sm text-gray-400">
            {confirmedCount === 0 && 'Select at least one brainrot to continue'}
            {confirmedCount > 0 && `Average confidence: ${Math.round(avgConfidence * 100)}%`}
          </div>
        </div>
        <button
          onClick={() => onConfirmAll(verifiedCards.filter(c => c.verified))}
          disabled={confirmedCount === 0}
          className={`
            px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2
            ${confirmedCount > 0
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          <Check size={20} />
          Add {confirmedCount > 0 && confirmedCount}
        </button>
      </div>
    </div>
  );
}

function getConfidenceColor(confidence) {
  if (confidence >= 0.9) return 'text-green-500';
  if (confidence >= 0.75) return 'text-yellow-500';
  return 'text-red-500';
}

function getConfidenceBgColor(confidence) {
  if (confidence >= 0.9) return 'bg-green-500';
  if (confidence >= 0.75) return 'bg-yellow-500';
  return 'bg-red-500';
}

function formatNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}


