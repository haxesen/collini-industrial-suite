import { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [currentTime, setCurrentTime] = useState('120')
  const [currentThickness, setCurrentThickness] = useState('17.86')
  const [targetThickness, setTargetThickness] = useState('23')
  const [batchNumber, setBatchNumber] = useState('2604260007')
  const [remainingTime, setRemainingTime] = useState(0)

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
        <div className="logo">COLLINI</div>
        <div className="subtitle">Schichtstärke Rechner</div>
      </header>

      <main>
        <div className="input-group">
          <label htmlFor="batch">Chargennummer</label>
          <div className="input-wrapper">
            <input
              id="batch"
              type="text"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Sarzsszám..."
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="currentTime">Köztes idő (Liegezeit)</label>
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
          <label htmlFor="currentThickness">Köztes mérés (Dicke)</label>
          <div className="input-wrapper">
            <input
              id="currentThickness"
              type="number"
              step="0.01"
              value={currentThickness}
              onChange={(e) => setCurrentThickness(e.target.value)}
            />
            <span className="unit">µm</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="targetThickness">Cél vastagság (Soll)</label>
          <div className="input-wrapper">
            <input
              id="targetThickness"
              type="number"
              step="0.1"
              value={targetThickness}
              onChange={(e) => setTargetThickness(e.target.value)}
            />
            <span className="unit">µm</span>
          </div>
        </div>

        <div className="result-card">
          <div className="result-label">Hátralévő idő</div>
          <div className="result-value">
            {remainingTime}
            <span className="result-unit">perc</span>
          </div>
        </div>

        <div className="footer-info">
          <div className="info-item">
            <span className="info-label">Összes idő</span>
            <span className="info-value">{parseInt(currentTime) + remainingTime} min</span>
          </div>
          <div className="info-item">
            <span className="info-label">Státusz</span>
            <span className="info-value" style={{color: '#00e5ff'}}>Aktív</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
