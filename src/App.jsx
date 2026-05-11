import { useState, useEffect } from 'react'
import './index.css'

const translations = {
  hu: {
    title: 'Rétegvastagság kalkulátor',
    batch: 'Sarzsszám',
    currentTime: 'Köztes idő (Liegezeit)',
    currentThickness: 'Köztes mérés (Dicke)',
    targetThickness: 'Cél vastagság (Soll)',
    remainingTime: 'Hátralévő idő',
    totalTime: 'Összes idő',
    status: 'Státusz',
    active: 'Aktív',
    unitMin: 'perc',
    unitMicron: 'µm'
  },
  de: {
    title: 'Schichtstärke Rechner',
    batch: 'Chargennummer',
    currentTime: 'Liegezeit (Zwischenm.)',
    currentThickness: 'Dicke (Zwischenm.)',
    targetThickness: 'Soll-Schichtdicke',
    remainingTime: 'Rest-Liegezeit',
    totalTime: 'Gesamtzeit',
    status: 'Status',
    active: 'Aktiv',
    unitMin: 'min',
    unitMicron: 'µm'
  }
}

function App() {
  const [lang, setLang] = useState('hu')
  const [currentTime, setCurrentTime] = useState('120')
  const [currentThickness, setCurrentThickness] = useState('17.86')
  const [targetThickness, setTargetThickness] = useState('23')
  const [batchNumber, setBatchNumber] = useState('2604260007')
  const [remainingTime, setRemainingTime] = useState(0)

  const t = translations[lang]

  useEffect(() => {
    const t1 = parseFloat(currentTime)
    const d1 = parseFloat(currentThickness)
    const dTarget = parseFloat(targetThickness)

    if (t1 > 0 && d1 > 0 && dTarget > 0) {
      const totalTime = (t1 * dTarget) / d1
      const rest = Math.max(0, totalTime - t1)
      setRemainingTime(Math.round(rest))
    } else {
      setRemainingTime(0)
    }
  }, [currentTime, currentThickness, targetThickness])

  return (
    <div className="app-container">
      <header>
        <div className="lang-toggle">
          <button 
            className={lang === 'hu' ? 'active' : ''} 
            onClick={() => setLang('hu')}
          >
            HU
          </button>
          <button 
            className={lang === 'de' ? 'active' : ''} 
            onClick={() => setLang('de')}
          >
            DE
          </button>
        </div>
        <div className="logo">COLLINI</div>
        <div className="subtitle">{t.title}</div>
      </header>

      <main>
        <div className="input-group">
          <label htmlFor="batch">{t.batch}</label>
          <div className="input-wrapper">
            <input
              id="batch"
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="currentTime">{t.currentTime}</label>
          <div className="input-wrapper">
            <input
              id="currentTime"
              type="number"
              value={currentTime}
              onChange={(e) => setCurrentTime(e.target.value)}
            />
            <span className="unit">MIN</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="currentThickness">{t.currentThickness}</label>
          <div className="input-wrapper">
            <input
              id="currentThickness"
              type="number"
              step="0.01"
              value={currentThickness}
              onChange={(e) => setCurrentThickness(e.target.value)}
            />
            <span className="unit">{t.unitMicron}</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="targetThickness">{t.targetThickness}</label>
          <div className="input-wrapper">
            <input
              id="targetThickness"
              type="number"
              step="0.1"
              value={targetThickness}
              onChange={(e) => setTargetThickness(e.target.value)}
            />
            <span className="unit">{t.unitMicron}</span>
          </div>
        </div>

        <div className="result-card">
          <div className="result-label">{t.remainingTime}</div>
          <div className="result-value">
            {remainingTime}
            <span className="result-unit">{t.unitMin}</span>
          </div>
        </div>

        <div className="footer-info">
          <div className="info-item">
            <span className="info-label">{t.totalTime}</span>
            <span className="info-value">{parseInt(currentTime || 0) + remainingTime} min</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t.status}</span>
            <span className="info-value" style={{color: '#00e5ff'}}>{t.active}</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
