import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-600',
      borderColor: 'border-green-500',
      iconColor: 'text-green-300',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-600',
      borderColor: 'border-red-500',
      iconColor: 'text-red-300',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-600',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-300',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-300',
    },
  };

  const { icon: Icon, bgColor, borderColor, iconColor } = config[toast.type] || config.info;

  return (
    <div
      className={`${bgColor} ${borderColor} border-2 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 animate-slideIn backdrop-blur-sm`}
    >
      <Icon size={20} className={iconColor} />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="hover:bg-white/20 rounded p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

