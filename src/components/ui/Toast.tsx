import React, { useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 3500
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        backgroundColor: '#1E1E1E',
        color: '#FFFFFF',
        padding: '12px 18px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--shadow-toast)',
        fontSize: '13px',
        maxWidth: '380px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <Info size={16} color="#8B85E9" style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#AAAAAA',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
