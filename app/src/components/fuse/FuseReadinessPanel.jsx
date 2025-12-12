import React, { useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, ArrowRight, Package, Zap } from 'lucide-react';
import { generateFusePlan } from '../../utils/fuseAnalyzer';
import { MUTATIONS } from '../../utils/incomeCalculator';

export default function FuseReadinessPanel({
  accounts,
  collections,
  brainrots,
  onTransferBrainrot,
  onStartFuse
}) {
  const [strategy, setStrategy] = useState('balance');
  const [expandedTransfers, setExpandedTransfers] = useState({});

  // Generate fuse plan
  const fusePlan = useMemo(() => {
    if (!accounts.length || !brainrots.length) return null;
    return generateFusePlan(accounts, collections, brainrots, strategy);
  }, [accounts, collections, brainrots, strategy]);

  if (!fusePlan) {
    return (
      <div className="text-center py-8">
        <Package size={48} className="mx-auto text-slate-600 mb-3" />
        <p className="text-gray-400">No accounts to analyze</p>
      </div>
    );
  }

  const { summary, readyAccounts, blockedAccounts, transferPlans } = fusePlan;

  const toggleTransfers = (accountId) => {
    setExpandedTransfers(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={24} className="text-yellow-400" />
            Fuse Readiness Analysis
          </h3>

          {/* Strategy Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Strategy:</span>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="balance">⚖️ Balance</option>
              <option value="maximize">⭐ Maximize Quality</option>
              <option value="disposal">🗑️ Disposal (Low-tier)</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Accounts</div>
            <div className="text-2xl font-bold text-white">{summary.totalAccounts}</div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">✅ Ready to Fuse</div>
            <div className="text-2xl font-bold text-green-400">{summary.readyToFuse}</div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">⚠️ Needs Transfers</div>
            <div className="text-2xl font-bold text-yellow-400">{summary.needsTransfers}</div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">❌ Insufficient</div>
            <div className="text-2xl font-bold text-red-400">{summary.insufficientBrainrots}</div>
          </div>
        </div>

        {/* Overall Status */}
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
          {summary.canGetAllFusing ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span className="font-medium">All accounts can fuse! Transfer plan available below.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={20} />
              <span className="font-medium">
                {summary.accountsThatCanFuse} of {summary.totalAccounts} accounts can fuse. 
                {summary.accountsThatCantFuse} need more brainrots.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ready Accounts Section */}
      {readyAccounts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            Ready to Fuse ({readyAccounts.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyAccounts.map(account => (
              <ReadyAccountCard
                key={account.accountId}
                account={account}
                onStartFuse={onStartFuse}
              />
            ))}
          </div>
        </div>
      )}

      {/* Blocked Accounts Section */}
      {blockedAccounts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <AlertCircle size={20} className="text-yellow-400" />
            Needs Transfers ({blockedAccounts.length})
          </h3>

          <div className="space-y-4">
            {transferPlans.map(plan => (
              <BlockedAccountCard
                key={plan.accountId}
                plan={plan}
                expanded={expandedTransfers[plan.accountId]}
                onToggle={() => toggleTransfers(plan.accountId)}
                onTransferBrainrot={onTransferBrainrot}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Ready Account Card
function ReadyAccountCard({ account, onStartFuse }) {
  const suggestedFuse = account.suggestedFuse;

  if (!suggestedFuse) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white mb-1">{account.accountName}</h4>
          <p className="text-sm text-gray-400">{account.availableCount} brainrots available</p>
        </div>
        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium">
          Ready ✓
        </span>
      </div>

      {/* Quality Indicator */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Expected Quality</span>
          <span className={`text-sm font-bold ${suggestedFuse.quality.color}`}>
            {suggestedFuse.quality.label}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Score: {suggestedFuse.totalScore}
        </div>
      </div>

      {/* Suggested Brainrots */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-2">Suggested Fuse (4):</div>
        <div className="space-y-1">
          {suggestedFuse.brainrots.slice(0, 4).map((entry, idx) => (
            <div key={entry.id} className="flex items-center gap-2 text-xs bg-slate-900/50 rounded p-2">
              {entry.brainrot.image && (
                <img
                  src={`/${entry.brainrot.image}`}
                  alt={entry.brainrot.name}
                  className="w-8 h-8 object-contain rounded bg-slate-800"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{entry.brainrot.name}</div>
                <div className="text-gray-400">
                  {entry.brainrot.rarity} • Score: {entry.fuseScore}
                </div>
              </div>
              {entry.mutation && entry.mutation !== 'none' && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: `${MUTATIONS[entry.mutation]?.color}30`,
                    color: MUTATIONS[entry.mutation]?.color
                  }}
                >
                  {MUTATIONS[entry.mutation]?.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onStartFuse && onStartFuse(account.accountId, suggestedFuse.brainrots)}
        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Zap size={16} />
        Start Fuse
      </button>
    </div>
  );
}

// Blocked Account Card
function BlockedAccountCard({ plan, expanded, onToggle, onTransferBrainrot }) {
  const canUnblock = plan.canBeUnblocked;

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border ${
      canUnblock ? 'border-yellow-500/30' : 'border-red-500/30'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white mb-1">{plan.accountName}</h4>
          <p className="text-sm text-gray-400">
            Needs {plan.needsCount} more brainrot{plan.needsCount !== 1 ? 's' : ''} to fuse
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          canUnblock 
            ? 'bg-yellow-600/20 text-yellow-400' 
            : 'bg-red-600/20 text-red-400'
        }`}>
          {canUnblock ? 'Can Unblock' : 'Insufficient'}
        </span>
      </div>

      {canUnblock && plan.suggestedTransfers.length > 0 && (
        <>
          <div className="mb-3">
            <button
              onClick={onToggle}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              {expanded ? '▼' : '▶'} View Suggested Transfers ({plan.suggestedTransfers.length})
            </button>
          </div>

          {expanded && (
            <div className="space-y-2 mb-3">
              {plan.suggestedTransfers.map((transfer, idx) => (
                <div key={transfer.id} className="bg-slate-900/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {transfer.brainrot.image && (
                      <img
                        src={`/${transfer.brainrot.image}`}
                        alt={transfer.brainrot.name}
                        className="w-10 h-10 object-contain rounded bg-slate-800"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {transfer.brainrot.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        From: {transfer.sourceAccountName} • Score: {transfer.fuseScore}
                      </div>
                      {transfer.mutation && transfer.mutation !== 'none' && (
                        <div className="text-xs mt-1">
                          <span
                            className="px-1.5 py-0.5 rounded font-medium"
                            style={{
                              backgroundColor: `${MUTATIONS[transfer.mutation]?.color}30`,
                              color: MUTATIONS[transfer.mutation]?.color
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
                        transfer.id,
                        transfer.sourceAccountId,
                        plan.accountId
                      );
                    }}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <ArrowRight size={16} />
                    Transfer
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              // Execute all transfers
              plan.suggestedTransfers.forEach(transfer => {
                onTransferBrainrot(transfer.id, transfer.sourceAccountId, plan.accountId);
              });
            }}
            className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight size={16} />
            Transfer All ({plan.suggestedTransfers.length})
          </button>
        </>
      )}

      {!canUnblock && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <XCircle size={16} />
          <span>Not enough brainrots available in other accounts</span>
        </div>
      )}
    </div>
  );
}

