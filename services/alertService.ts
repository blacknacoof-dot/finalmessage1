// Alert Replacement Service with Rollback Capability
import React from 'react';

export interface AlertData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title?: string;
  message: string;
  duration?: number; // for toast (auto-dismiss)
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

// Original alert backup for rollback
const originalAlert = window.alert;
const originalConfirm = window.confirm;

// Alert replacement functions
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export const showModal = (config: Omit<AlertData, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9);
  const event = new CustomEvent('show-modal', {
    detail: { ...config, id }
  });
  window.dispatchEvent(event);
  return id;
};

export const showConfirm = (message: string, onConfirm?: (confirmed: boolean) => void, onCancel?: () => void) => {
  return showModal({
    type: 'confirm',
    message,
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: () => {
      if (onConfirm) onConfirm(true);
    },
    onCancel: () => {
      if (onConfirm) onConfirm(false);
      if (onCancel) onCancel();
    }
  });
};

// Replace native functions
export const replaceNativeAlerts = () => {
  // Replace alert
  window.alert = (message: string) => {
    showToast(message, 'info');
  };

  // Replace confirm
  window.confirm = (message: string): boolean => {
    let result = false;
    showModal({
      type: 'confirm',
      message,
      confirmText: '확인',
      cancelText: '취소',
      onConfirm: () => { result = true; },
      onCancel: () => { result = false; }
    });
    return result; // Note: This is synchronous fallback, actual implementation should use callbacks
  };
};

// Rollback to original alerts
export const rollbackToNativeAlerts = () => {
  window.alert = originalAlert;
  window.confirm = originalConfirm;
};

// Export original functions for manual rollback
export const nativeAlert = originalAlert;
export const nativeConfirm = originalConfirm;