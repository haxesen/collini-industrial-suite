import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay = ({ message = 'Laden / Betöltés...' }) => {
  return (
    <div className="loading-overlay">
      <div className="loader-content">
        <div className="spinner-wrapper">
          <Loader2 className="spinner-icon" size={48} />
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
