import React from 'react';
import { 
  ChevronLeft, History, Lock, Unlock, 
  RotateCcw, Save, FileText, Trash2, X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useCalculator } from './useCalculator';
import LanguageToggle from '../../components/LanguageToggle';
import colliniLogo from '../../assets/Collini_Logo.svg';

const Calculator = () => {
  const { t, setView, isAdmin, setIsAdmin, setShowAdminLogin } = useApp();
  const calc = useCalculator(t);

  const { val: formattedVal, unit: formattedUnit } = calc.formatResult(calc.remainingTime);
  const statusClass = calc.getStatusColorClass(calc.remainingTime);

  return (
    <div className="app-container">
      <header className="classic-header">
        <div className="header-top-classic">
          <button className="back-btn" onClick={() => setView('hub')}>
            <ChevronLeft size={20} /> {t.back}
          </button>
          <LanguageToggle className="lang-toggle-header" />
          <div className="header-actions">
            <button className="icon-btn-header" onClick={() => calc.setShowHistory(true)}><History size={20} /></button>
            <button className={`icon-btn-header ${isAdmin ? 'admin-active' : ''}`} onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}>
              {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          </div>
        </div>
        <div className="logo-section">
          <img src={colliniLogo} alt="Collini" className="header-logo" />
          <h2 className="classic-title">{t.title}</h2>
        </div>
      </header>

      <main className="calculator-main">
        <div className="input-group">
          <label>{t.batch}</label>
          <input type="text" value={calc.batchNumber} onChange={(e) => calc.setBatchNumber(e.target.value)} placeholder="PL999..." />
        </div>

        <div className="input-group">
          <label>{t.productName}</label>
          <select value={calc.selectedProductName} onChange={(e) => {
            const p = calc.products.find(x => x.name === e.target.value);
            calc.setSelectedProductName(e.target.value);
            if(p) calc.setTargetThickness(p.target_thickness.toString());
          }}>
            <option value="">{t.selectProduct}</option>
            {calc.products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid-2">
          <div className="input-group">
            <label>{t.currentTime} ({t.unitMin})</label>
            <input type="number" value={calc.currentTime} onChange={(e) => calc.setCurrentTime(e.target.value)} />
          </div>
          <div className="input-group">
            <label>{t.currentThickness} ({t.unitMicron})</label>
            <input type="number" value={calc.currentThickness} onChange={(e) => calc.setCurrentThickness(e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <label>{t.targetThickness} ({t.unitMicron})</label>
          <div className="input-wrapper">
            <input type="number" value={calc.targetThickness} onChange={(e) => calc.setTargetThickness(e.target.value)} />
            <span className="unit">µm</span>
          </div>
        </div>

        <button className="reset-btn-classic" onClick={calc.reset}><RotateCcw size={16} /> {t.reset}</button>

        <div className={`result-card ${statusClass}`}>
          <div className="unit-selector">
            {['min', 'sec', 'hm'].map(unit => (
              <button 
                key={unit}
                className={calc.outputUnit === unit ? 'active' : ''} 
                onClick={() => calc.setOutputUnit(unit)}
              >
                {unit === 'hm' ? t.unitHourMin : unit === 'sec' ? t.unitSec : t.unitMin}
              </button>
            ))}
          </div>
          <div className="result-label">{t.remainingTime}</div>
          <div className="result-value">
            {formattedVal}
            <span className="result-unit">{formattedUnit}</span>
          </div>
          <div className="result-actions">
            <button className={`save-result-btn ${calc.isSaved ? 'saved' : ''}`} onClick={calc.saveCalculation} disabled={!calc.remainingTime}>
              {calc.isSaved ? t.saved : <><Save size={18} /> {t.saveResult}</>}
            </button>
            <button className="print-btn" onClick={() => window.print()} disabled={!calc.remainingTime}><FileText size={18} /> {t.print}</button>
          </div>
        </div>
      </main>

      {calc.showHistory && (
        <div className="manager-overlay">
          <div className="manager-content history-content">
            <div className="manager-header">
              <h3>{t.history}</h3>
              <button className="icon-btn" onClick={() => calc.setShowHistory(false)}><X size={24} /></button>
            </div>
            <div className="history-list">
              {calc.history.length === 0 ? <p>{t.noHistory}</p> : calc.history.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-main">
                    <strong>{h.batch_number || '---'}</strong> - {h.product_name} ({Math.round(h.calculation_result)} min)
                  </div>
                  <div className="history-actions">
                    <button onClick={() => calc.generatePDF(h)}><FileText size={14} /></button>
                    {isAdmin && <button onClick={() => calc.deleteHistory(h.id)}><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;
