import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((config) => {
    const id = `toast-${toastId++}`;
    const toast = {
      id,
      type: config.type || 'info', // 'success', 'error', 'warning', 'info'
      message: config.message,
      duration: config.duration || 3000,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
  };
}

