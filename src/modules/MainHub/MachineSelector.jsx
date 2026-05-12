import React from 'react';
import { useApp } from '../../context/AppContext';
import { Factory, ChevronRight } from 'lucide-react';
import colliniLogo from '../../assets/Collini_Logo.svg';

const MachineSelector = () => {
  const { machines, setSelectedLine, t } = useApp();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="machine-selector-container">
      <button 
        className="floating-fullscreen-btn" 
        onClick={toggleFullscreen}
        title="Fullscreen"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>

      <div className="selector-content">
        <header className="selector-header">
          <img src={colliniLogo} alt="Collini" className="selector-logo" />
          <h1>Industrial Suite</h1>
          <p>Bitte wählen Sie eine Produktionslinie</p>
          <div style={{ marginTop: '15px', fontSize: '0.8rem', opacity: 0.4, fontStyle: 'italic' }}>
            * Für das beste Erlebnis wird die Verwendung im Vollbildmodus empfohlen.
          </div>
        </header>

        <div className="machine-grid">
          {[...machines].sort((a, b) => (b.is_active - a.is_active)).map((machine) => (
            <div 
              key={machine.id} 
              className={`machine-card ${!machine.is_active ? 'machine-card-disabled' : ''}`}
              onClick={() => {
                if (machine.is_active) {
                  localStorage.setItem('collini_selected_line', machine.name);
                  setSelectedLine(machine.name);
                }
              }}
            >
              <div className="machine-icon">
                <Factory size={32} />
              </div>
              <div className="machine-info">
                <h3>{machine.name}</h3>
                {machine.description && <p>{machine.description}</p>}
                {!machine.is_active && (
                  <span className="coming-soon-badge-small">Coming Soon</span>
                )}
              </div>
              {machine.is_active && <div className="machine-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MachineSelector;
