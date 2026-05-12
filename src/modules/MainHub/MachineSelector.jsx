import React from 'react';
import { useApp } from '../../context/AppContext';
import { Factory, ChevronRight } from 'lucide-react';
import colliniLogo from '../../assets/Collini_Logo.svg';

const MachineSelector = () => {
  const { machines, setSelectedLine, t } = useApp();

  return (
    <div className="machine-selector-container">
      <div className="selector-content">
        <header className="selector-header">
          <img src={colliniLogo} alt="Collini" className="selector-logo" />
          <h1>Industrial Suite</h1>
          <p>Bitte wählen Sie eine Produktionslinie</p>
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
