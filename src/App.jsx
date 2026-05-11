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
    unitMicron: 'µm',
    manageProducts: 'Termékek kezelése',
    productName: 'Termék neve',
    saveProduct: 'Mentés',
    selectProduct: 'Válassz terméket...',
    delete: 'Törlés',
    close: 'Bezárás',
    manualEntry: 'Kézi bevitel'
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
    unitMicron: 'µm',
    manageProducts: 'Produkte verwalten',
    productName: 'Produktname',
    saveProduct: 'Speichern',
    selectProduct: 'Produkt wählen...',
    delete: 'Löschen',
    close: 'Schließen',
    manualEntry: 'Manuelle Eingabe'
  }
}

function App() {
  const [lang, setLang] = useState('hu')
  const [currentTime, setCurrentTime] = useState('120')
  const [currentThickness, setCurrentThickness] = useState('17.86')
  const [targetThickness, setTargetThickness] = useState('23')
  const [batchNumber, setBatchNumber] = useState('2604260007')
  const [remainingTime, setRemainingTime] = useState(0)
  
  // Product management state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('collini_products')
    return saved ? JSON.parse(saved) : []
  })
  const [showManager, setShowManager] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductSoll, setNewProductSoll] = useState('')

  const t = translations[lang]

  useEffect(() => {
    localStorage.setItem('collini_products', JSON.stringify(products))
  }, [products])

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

  const addProduct = () => {
    if (newProductName && newProductSoll) {
      setProducts([...products, { name: newProductName, soll: newProductSoll }])
      setNewProductName('')
      setNewProductSoll('')
    }
  }

  const deleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleProductSelect = (e) => {
    const val = e.target.value
    if (val !== 'manual') {
      setTargetThickness(val)
    }
  }

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <div className="lang-toggle">
            <button className={lang === 'hu' ? 'active' : ''} onClick={() => setLang('hu')}>HU</button>
            <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
          </div>
          <button className="settings-btn" onClick={() => setShowManager(!showManager)}>
            ⚙️
          </button>
        </div>
        <div className="logo">COLLINI</div>
        <div className="subtitle">{t.title}</div>
      </header>

      {showManager ? (
        <div className="manager-overlay">
          <div className="manager-content">
            <h3>{t.manageProducts}</h3>
            <div className="product-form">
              <input 
                type="text" 
                placeholder={t.productName} 
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
              <input 
                type="number" 
                placeholder={t.targetThickness} 
                value={newProductSoll}
                onChange={(e) => setNewProductSoll(e.target.value)}
              />
              <button className="add-btn" onClick={addProduct}>{t.saveProduct}</button>
            </div>
            <div className="product-list">
              {products.map((p, i) => (
                <div key={i} className="product-item">
                  <span>{p.name} ({p.soll} µm)</span>
                  <button onClick={() => deleteProduct(i)}>{t.delete}</button>
                </div>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowManager(false)}>{t.close}</button>
          </div>
        </div>
      ) : null}

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
          <label htmlFor="product-select">{t.selectProduct}</label>
          <div className="input-wrapper">
            <select id="product-select" onChange={handleProductSelect} defaultValue="manual">
              <option value="manual">{t.manualEntry}</option>
              {products.map((p, i) => (
                <option key={i} value={p.soll}>{p.name}</option>
              ))}
            </select>
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
