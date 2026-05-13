import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Droplets, 
  Clock, 
  Database,
  BarChart3,
  LayoutDashboard,
  Printer,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format } from 'date-fns';

const ChemNickel = () => {
  const { t, setView, selectedLine } = useApp();
  const [mode, setMode] = useState('tracking');

  const handleExportPDF = () => { window.print(); };

  return (
    <div className="full-view-wrapper">
      {/* Print Header */}
      <div className="print-only-header">
        <div className="print-header-top">
          <span className="print-app-name">Collini Industrial Suite</span>
          <span className="print-date">{format(new Date(), 'dd.MM.yyyy HH:mm')}</span>
        </div>
        <div className="print-module-title">
          <h1>CHEM-NICKEL UMPUMPEN ABLAUF</h1>
          {selectedLine && <span className="line-badge">{selectedLine}</span>}
        </div>
      </div>

      {/* Main Header */}
      <div className="wt-header no-print">
        <div className="header-left">
          <button onClick={() => setView('hub')} className="back-btn">
            <ChevronLeft size={20} /> {t.back}
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0, textTransform: 'uppercase' }}>
            {t.chemNickel}
            {selectedLine && <span className="line-badge" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>{selectedLine}</span>}
          </h1>
        </div>
        
        <div className="header-right">
          {/* Actions can be added here later */}
        </div>
      </div>

      <div className="animate-fade-in" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '60px', maxWidth: '800px', margin: '0 auto' }}>
          <Droplets size={80} className="text-accent" style={{ marginBottom: '30px', opacity: 0.5 }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px' }}>{t.chemNickel}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '40px' }}>
            Dieses Modul befindet sich aktuell in der Entwicklung. Hier wird demnächst die Ablaufverfolgung der Chemisch-Nickel Umpumpvorgänge implementiert.
          </p>
          
          <div className="info-box-compact" style={{ justifyContent: 'center' }}>
            <AlertCircle size={24} className="text-accent" />
            <p>Geplanter Start: KW 21</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemNickel;
