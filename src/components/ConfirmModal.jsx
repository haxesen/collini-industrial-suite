import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const ConfirmModal = () => {
  const { confirmModal, setConfirmModal, t } = useApp();

  if (!confirmModal.show) return null;

  const handleConfirm = () => {
    if (confirmModal.onConfirm) confirmModal.onConfirm();
    setConfirmModal({ show: false, message: '', onConfirm: null });
  };

  const handleCancel = () => {
    setConfirmModal({ show: false, message: '', onConfirm: null });
  };

  return (
    <div className="manager-overlay" style={{ zIndex: 10000 }}>
      <div className="manager-content confirm-modal-content">
        <div className="confirm-icon-wrapper">
          <AlertTriangle size={48} />
        </div>
        
        <div className="confirm-body">
          <h3>{confirmModal.message}</h3>
        </div>

        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={handleCancel}>
            <X size={18} /> {t.cancel}
          </button>
          <button className="confirm-btn success" onClick={handleConfirm}>
            <Check size={18} /> {t.delete}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
