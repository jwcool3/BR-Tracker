import React, { useState, useMemo } from 'react';
import { ArrowLeft, AlertTriangle, Check, X, Trash2, Edit, GitMerge, Info } from 'lucide-react';

export default function DataVerificationView({ 
  verificationReport,
  brainrots,
  onBack,
  onDeleteBrainrot,
  onUpdateBrainrot,
  onMergeBrainrots
}) {
  const [activeTab, setActiveTab] = useState('similar'); // 'similar' or 'subsets'
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [resolvedIssues, setResolvedIssues] = useState(new Set());

  if (!verificationReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-20">
          <AlertTriangle size={64} className="mx-auto text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Verification Report</h2>
          <p className="text-gray-400">Run the verification script first</p>
        </div>
      </div>
    );
  }

  const { details, issues } = verificationReport;
  const similarNames = details.similar_names || [];
  const suspicious = details.suspicious || [];

  const unresolvedSimilar = similarNames.filter((_, idx) => !resolvedIssues.has(`similar-${idx}`));
  const unresolvedSuspicious = suspicious.filter((_, idx) => !resolvedIssues.has(`suspicious-${idx}`));

  const handleResolve = (type, index, action, data) => {
    const issueKey = `${type}-${index}`;
    
    // Execute the action
    if (action === 'delete') {
      onDeleteBrainrot(data.brainrotId);
    } else if (action === 'keep-both') {
      // Do nothing, just mark as resolved
    } else if (action === 'merge') {
      onMergeBrainrots(data.br1Id, data.br2Id, data.keepData);
    } else if (action === 'rename') {
      onUpdateBrainrot(data.brainrotId, { name: data.newName });
    }

    // Mark as resolved
    setResolvedIssues(prev => new Set([...prev, issueKey]));
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
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Data Verification</h1>
              <p className="text-gray-400">Review and fix duplicate or suspicious brainrot entries</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Total Brainrots</div>
            <div className="text-2xl font-bold text-white">{verificationReport.total_brainrots}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Total Issues</div>
            <div className="text-2xl font-bold text-yellow-400">{verificationReport.total_issues}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Similar Names</div>
            <div className="text-2xl font-bold text-orange-400">{issues.similar_names}</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="text-gray-400 text-sm mb-1">Name Subsets</div>
            <div className="text-2xl font-bold text-red-400">{issues.suspicious}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Resolution Progress</span>
            <span className="text-sm text-gray-400">
              {resolvedIssues.size} / {verificationReport.total_issues} resolved
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
              style={{ width: `${(resolvedIssues.size / verificationReport.total_issues) * 100}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('similar')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'similar'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <GitMerge size={20} />
              <span>Similar Names ({unresolvedSimilar.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subsets')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'subsets'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <AlertTriangle size={20} />
              <span>Name Subsets ({unresolvedSuspicious.length})</span>
            </button>
          </div>
        </div>

        {/* Similar Names Tab */}
        {activeTab === 'similar' && (
          <div className="space-y-4">
            {unresolvedSimilar.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <Check size={48} className="mx-auto text-green-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">All Similar Names Resolved!</h3>
                <p className="text-gray-400">Great job cleaning up the data</p>
              </div>
            ) : (
              unresolvedSimilar.map((issue, idx) => (
                <SimilarNameIssueCard
                  key={idx}
                  issue={issue}
                  index={idx}
                  expanded={expandedIssue === `similar-${idx}`}
                  onToggle={() => setExpandedIssue(expandedIssue === `similar-${idx}` ? null : `similar-${idx}`)}
                  onResolve={(action, data) => handleResolve('similar', idx, action, data)}
                />
              ))
            )}
          </div>
        )}

        {/* Name Subsets Tab */}
        {activeTab === 'subsets' && (
          <div className="space-y-4">
            {unresolvedSuspicious.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <Check size={48} className="mx-auto text-green-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">All Name Subsets Resolved!</h3>
                <p className="text-gray-400">Database is clean</p>
              </div>
            ) : (
              unresolvedSuspicious.map((issue, idx) => (
                <NameSubsetIssueCard
                  key={idx}
                  issue={issue}
                  index={idx}
                  expanded={expandedIssue === `suspicious-${idx}`}
                  onToggle={() => setExpandedIssue(expandedIssue === `suspicious-${idx}` ? null : `suspicious-${idx}`)}
                  onResolve={(action, data) => handleResolve('suspicious', idx, action, data)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Similar Name Issue Card
function SimilarNameIssueCard({ issue, index, expanded, onToggle, onResolve }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-orange-600/20 text-orange-400 rounded font-medium">
              {issue.similarity} Similar
            </span>
            <span className="text-xs text-gray-500">Issue #{index + 1}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            "{issue.name1}" vs "{issue.name2}"
          </h3>
          <p className="text-sm text-gray-400">These names are very similar - might be duplicates</p>
        </div>

        <button
          onClick={onToggle}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {expanded ? 'Collapse' : 'Review'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BrainrotComparisonCard brainrot={issue.br1} label="Option 1" />
            <BrainrotComparisonCard brainrot={issue.br2} label="Option 2" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onResolve('keep-both', {})}
              className="flex-1 min-w-[200px] px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-blue-600/50"
            >
              <Check size={18} />
              Keep Both (Different)
            </button>

            <button
              onClick={() => onResolve('delete', { brainrotId: issue.br1.id })}
              className="flex-1 min-w-[200px] px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-red-600/50"
            >
              <Trash2 size={18} />
              Delete "{issue.name1}"
            </button>

            <button
              onClick={() => onResolve('delete', { brainrotId: issue.br2.id })}
              className="flex-1 min-w-[200px] px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-red-600/50"
            >
              <Trash2 size={18} />
              Delete "{issue.name2}"
            </button>
          </div>

          {/* Helper Text */}
          <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-2">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">Tip:</strong> Check the cost and income values. If they're the same, likely a duplicate. If different, they might be separate brainrots.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Name Subset Issue Card
function NameSubsetIssueCard({ issue, index, expanded, onToggle, onResolve }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-red-500/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded font-medium">
              Name Subset
            </span>
            <span className="text-xs text-gray-500">Issue #{index + 1}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            <span className="text-yellow-400">"{issue.short_name}"</span> is subset of <span className="text-green-400">"{issue.long_name}"</span>
          </h3>
          <p className="text-sm text-gray-400">One name contains the other - might be duplicate or shortened version</p>
        </div>

        <button
          onClick={onToggle}
          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {expanded ? 'Collapse' : 'Review'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          {/* Side-by-side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BrainrotComparisonCard brainrot={issue.short_br} label="Short Name" highlight="yellow" />
            <BrainrotComparisonCard brainrot={issue.long_br} label="Long Name" highlight="green" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onResolve('keep-both', {})}
              className="flex-1 min-w-[200px] px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-blue-600/50"
            >
              <Check size={18} />
              Keep Both (Different)
            </button>

            <button
              onClick={() => onResolve('delete', { brainrotId: issue.short_br.id })}
              className="flex-1 min-w-[200px] px-4 py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-yellow-600/50"
            >
              <Trash2 size={18} />
              Delete Short Name
            </button>

            <button
              onClick={() => onResolve('delete', { brainrotId: issue.long_br.id })}
              className="flex-1 min-w-[200px] px-4 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-green-600/50"
            >
              <Trash2 size={18} />
              Delete Long Name
            </button>
          </div>

          {/* Helper Text */}
          <div className="bg-slate-900/50 rounded-lg p-3 flex items-start gap-2">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-400">
              <strong className="text-blue-400">Common cases:</strong> Short names are often nicknames or abbreviations. If stats match exactly, delete the short version. If stats differ significantly, they're likely different brainrots.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Brainrot Comparison Card
function BrainrotComparisonCard({ brainrot, label, highlight }) {
  const borderColor = highlight === 'yellow' ? 'border-yellow-500/50' : highlight === 'green' ? 'border-green-500/50' : 'border-slate-600';
  
  return (
    <div className={`bg-slate-900/50 rounded-lg p-4 border ${borderColor}`}>
      <div className="text-xs font-medium text-gray-400 mb-3">{label}</div>
      
      {brainrot.image && (
        <div className="mb-3">
          <img
            src={`/${brainrot.image}`}
            alt={brainrot.name}
            className="w-full h-32 object-contain rounded bg-slate-800"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-500">Name</div>
          <div className="text-sm font-bold text-white">{brainrot.name}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500">ID</div>
          <div className="text-xs font-mono text-gray-400">{brainrot.id}</div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-gray-500">Cost</div>
            <div className="text-sm text-white">
              {brainrot.cost ? `$${brainrot.cost.toLocaleString()}` : 'N/A'}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Income/s</div>
            <div className="text-sm text-green-400">
              {brainrot.income_per_second ? `$${brainrot.income_per_second.toLocaleString()}` : 'N/A'}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Rarity</div>
          <div className="text-sm capitalize">
            <span className={`px-2 py-1 rounded ${getRarityBg(brainrot.rarity)}`}>
              {brainrot.rarity}
            </span>
          </div>
        </div>

        {brainrot.event && (
          <div>
            <div className="text-xs text-gray-500">Event</div>
            <div className="text-sm text-purple-400">{brainrot.event}</div>
          </div>
        )}

        {brainrot.source && (
          <div>
            <div className="text-xs text-gray-500">Source</div>
            <div className="text-sm text-cyan-400">{brainrot.source}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for rarity colors
function getRarityBg(rarity) {
  const colors = {
    common: 'bg-gray-600/20 text-gray-400',
    rare: 'bg-blue-600/20 text-blue-400',
    epic: 'bg-purple-600/20 text-purple-400',
    legendary: 'bg-yellow-600/20 text-yellow-400',
    mythic: 'bg-pink-600/20 text-pink-400',
    brainrot_god: 'bg-red-600/20 text-red-400',
    og: 'bg-orange-600/20 text-orange-400',
    secret: 'bg-cyan-600/20 text-cyan-400',
    unknown: 'bg-slate-600/20 text-slate-400'
  };
  return colors[rarity] || colors.unknown;
}

