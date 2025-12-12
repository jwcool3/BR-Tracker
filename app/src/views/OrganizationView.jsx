import React, { useMemo, useState } from 'react';
import { ArrowLeft, TrendingUp, Package, Sparkles, ArrowRight, Check, X } from 'lucide-react';
import { analyzeAllAccounts } from '../utils/accountAnalyzer';
import { MUTATIONS } from '../utils/incomeCalculator';

export default function OrganizationView({ 
  accounts, 
  collections, 
  brainrots, 
  onBack,
  onTransferBrainrot 
}) {
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  // Run analysis
  const analysis = useMemo(() => {
    if (!accounts.length || !brainrots.length) return null;
    return analyzeAllAccounts(accounts, collections, brainrots);
  }, [accounts, collections, brainrots]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Data Available</h2>
            <p className="text-gray-400">Add some accounts and brainrots to see organization insights</p>
          </div>
        </div>
      </div>
    );
  }

  const { accountAnalyses, recommendations, summary } = analysis;

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
      mythic: 'text-pink-400',
      brainrot_god: 'text-red-400',
      og: 'text-orange-400',
      secret: 'text-cyan-400'
    };
    return colors[rarity] || 'text-gray-400';
  };

  const getMutationColor = (mutation) => {
    return MUTATIONS[mutation]?.color || '#666';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Organization Assistant</h1>
              <p className="text-gray-400">Smart recommendations to optimize your collection</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Total Accounts</div>
            <div className="text-2xl font-bold text-white">{summary.totalAccounts}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">With Patterns</div>
            <div className="text-2xl font-bold text-green-400">{summary.accountsWithPatterns}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Recommendations</div>
            <div className="text-2xl font-bold text-blue-400">{summary.totalRecommendations}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">High Priority</div>
            <div className="text-2xl font-bold text-yellow-400">{summary.highPriorityRecommendations}</div>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-green-400" />
              Recommendations
            </h2>

            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <RecommendationCard
                  key={idx}
                  recommendation={rec}
                  onSelect={() => setSelectedRecommendation(rec)}
                  isSelected={selectedRecommendation === rec}
                  getRarityColor={getRarityColor}
                  getMutationColor={getMutationColor}
                  onTransferBrainrot={onTransferBrainrot}
                />
              ))}
            </div>
          </div>
        )}

        {/* Account Analysis Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package size={24} className="text-blue-400" />
            Account Analysis
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {accountAnalyses.map(accountAnalysis => (
              <AccountAnalysisCard
                key={accountAnalysis.accountId}
                analysis={accountAnalysis}
                getRarityColor={getRarityColor}
                getMutationColor={getMutationColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Recommendation Card Component
function RecommendationCard({ 
  recommendation, 
  onSelect, 
  isSelected, 
  getRarityColor, 
  getMutationColor,
  onTransferBrainrot 
}) {
  const [expandedTransfers, setExpandedTransfers] = useState(false);
  const priorityColors = {
    high: 'border-yellow-500 bg-yellow-500/10',
    medium: 'border-blue-500 bg-blue-500/10',
    low: 'border-gray-500 bg-gray-500/10'
  };

  const priorityLabels = {
    high: '🔥 High Priority',
    medium: '💡 Medium Priority',
    low: '📌 Low Priority'
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border-2 ${priorityColors[recommendation.priority]} transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium px-2 py-1 rounded bg-slate-700 text-white">
              {priorityLabels[recommendation.priority]}
            </span>
            {recommendation.type === 'consolidate' && (
              <span className="text-xs px-2 py-1 rounded bg-green-600/20 text-green-400">
                Consolidate
              </span>
            )}
            {recommendation.type === 'theme_potential' && (
              <span className="text-xs px-2 py-1 rounded bg-purple-600/20 text-purple-400">
                Theme Potential
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {recommendation.targetAccountName}
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            {recommendation.impact}
          </p>

          {recommendation.pattern && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Current:</span>
              <span className="font-medium text-white">
                {recommendation.pattern.description}
              </span>
            </div>
          )}
        </div>

        {recommendation.type === 'consolidate' && recommendation.suggestedTransfers && (
          <button
            onClick={() => setExpandedTransfers(!expandedTransfers)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {expandedTransfers ? 'Hide' : 'View'} Transfers ({recommendation.suggestedTransfers.length})
          </button>
        )}
      </div>

      {/* Expanded Transfers List */}
      {expandedTransfers && recommendation.suggestedTransfers && (
        <div className="mt-4 border-t border-slate-700 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3">
            Suggested Transfers ({recommendation.suggestedTransfers.length})
          </h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recommendation.suggestedTransfers.map((transfer, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {transfer.image && (
                    <img
                      src={`/${transfer.image}`}
                      alt={transfer.brainrotName}
                      className="w-12 h-12 object-contain rounded bg-slate-800"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">
                      {transfer.brainrotName}
                    </div>
                    <div className="text-xs text-gray-400">
                      From: {transfer.sourceAccountName}
                    </div>
                    {transfer.mutation && transfer.mutation !== 'none' && (
                      <div className="text-xs mt-1">
                        <span 
                          className="px-1.5 py-0.5 rounded font-medium"
                          style={{ 
                            backgroundColor: `${getMutationColor(transfer.mutation)}30`,
                            color: getMutationColor(transfer.mutation)
                          }}
                        >
                          {MUTATIONS[transfer.mutation]?.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onTransferBrainrot(
                      transfer.collectionEntryId,
                      transfer.sourceAccountId,
                      recommendation.targetAccountId
                    );
                  }}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowRight size={16} />
                  Transfer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Account Analysis Card Component
function AccountAnalysisCard({ analysis, getRarityColor, getMutationColor }) {
  if (analysis.isEmpty) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="font-bold text-white mb-2">{analysis.accountName}</h3>
        <p className="text-gray-400 text-sm">No brainrots in this account</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-white mb-1">{analysis.accountName}</h3>
          <p className="text-gray-400 text-sm">{analysis.totalBrainrots} brainrots</p>
        </div>

        {analysis.patterns.length > 0 && (
          <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
            {analysis.patterns.length} Pattern{analysis.patterns.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Patterns */}
      {analysis.patterns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Detected Patterns</h4>
          <div className="space-y-2">
            {analysis.patterns.map((pattern, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">
                    {pattern.description}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    pattern.strength === 'strong' 
                      ? 'bg-green-600/20 text-green-400' 
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {pattern.strength}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${
                      pattern.strength === 'strong' 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${pattern.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-3">
        {/* Rarity Breakdown */}
        {Object.keys(analysis.rarityBreakdown).length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Rarity Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.rarityBreakdown).map(([rarity, count]) => (
                <span key={rarity} className={`text-xs px-2 py-1 rounded bg-slate-900 ${getRarityColor(rarity)}`}>
                  {rarity.replace('_', ' ')}: {count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mutation Breakdown */}
        {Object.entries(analysis.mutationBreakdown).filter(([m]) => m !== 'none').length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">Mutations</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.mutationBreakdown)
                .filter(([mutation]) => mutation !== 'none')
                .map(([mutation, count]) => (
                  <span 
                    key={mutation} 
                    className="text-xs px-2 py-1 rounded font-medium"
                    style={{ 
                      backgroundColor: `${getMutationColor(mutation)}30`,
                      color: getMutationColor(mutation)
                    }}
                  >
                    {MUTATIONS[mutation]?.name}: {count}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

