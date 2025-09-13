interface ShowToastOptions {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ShowModalOptions {
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const showToast = ({ message, type = 'info', duration = 4000 }: ShowToastOptions) => {
  const event = new CustomEvent('show-toast', {
    detail: { message, type, duration }
  });
  window.dispatchEvent(event);
};

export const showModal = (options: ShowModalOptions) => {
  const id = Math.random().toString(36).substr(2, 9);
  const event = new CustomEvent('show-modal', {
    detail: { id, ...options }
  });
  window.dispatchEvent(event);
};

// 편의 함수들
export const toast = {
  success: (message: string, duration?: number) => showToast({ message, type: 'success', duration }),
  error: (message: string, duration?: number) => showToast({ message, type: 'error', duration }),
  warning: (message: string, duration?: number) => showToast({ message, type: 'warning', duration }),
  info: (message: string, duration?: number) => showToast({ message, type: 'info', duration })
};

export const modal = {
  success: (title: string, message: string, onClose?: () => void) => 
    showModal({ type: 'success', title, message, onClose }),
  error: (title: string, message: string, onClose?: () => void) => 
    showModal({ type: 'error', title, message, onClose }),
  warning: (title: string, message: string, onClose?: () => void) => 
    showModal({ type: 'warning', title, message, onClose }),
  info: (title: string, message: string, onClose?: () => void) => 
    showModal({ type: 'info', title, message, onClose }),
  confirm: (title: string, message: string, onConfirm?: () => void, onCancel?: () => void, confirmText?: string, cancelText?: string) =>
    showModal({ type: 'confirm', title, message, onConfirm, onCancel, confirmText, cancelText })
};