import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showFooter = true,
  confirmText = 'Simpan',
  cancelText = 'Batal',
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  confirmVariant = 'primary',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isVisible) return null;

  // Size class
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Handle ESC key press
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex="-1"
    >
      <div
        className={`${sizeClasses[size]} w-full bg-white rounded-lg shadow-xl transform transition-transform ${
          isOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {showFooter && (
          <div className="px-6 py-3 flex justify-end space-x-2 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={confirmDisabled || confirmLoading}
              >
                {confirmLoading ? 'Loading...' : confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;