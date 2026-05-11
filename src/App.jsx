import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import colliniLogo from './assets/Collini_Logo.svg'
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
    unitSec: 'mp',
    unitHourMin: 'ó:p',
    unitMicron: 'µm',
    manageProducts: 'Termékek kezelése',
    productName: 'Termék neve',
    saveProduct: 'Mentés',
    updateProduct: 'Frissítés',
    selectProduct: 'Válassz terméket...',
    delete: 'Törlés',
    edit: 'Szerkeszt',
    close: 'Bezárás',
    manualEntry: 'Kézi bevitel',
    loading: 'Betöltés...',
    createdBy: 'Készítette: Horvát Tamás'
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
    unitSec: 'sek',
    unitHourMin: 'h:m',
    unitMicron: 'µm',
    manageProducts: 'Produkte verwalten',
    productName: 'Produktname',
    saveProduct: 'Speichern',
    updateProduct: 'Aktualisieren',
    selectProduct: 'Produkt wählen...',
    delete: 'Löschen',
    edit: 'Edit',
    close: 'Schließen',
    manualEntry: 'Manuelle Eingabe',
    loading: 'Laden...',
    createdBy: 'Erstellt von Tamas Horvát'
  }
}

function App() {
  const [lang, setLang] = useState('hu')
  const [currentTime, setCurrentTime] = useState('120')
  const [currentThickness, setCurrentThickness] = useState('17.86')
  const [targetThickness, setTargetThickness] = useState('23')
  const [batchNumber, setBatchNumber] = useState('2604260007')
  const [remainingTime, setRemainingTime] = useState(0)
  const [outputUnit, setOutputUnit] = useState('min')
  
  // Product management state
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManager, setShowManager] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductSoll, setNewProductSoll] = useState('')
  const [editingId, setEditingId] = useState(null)

  const t = translations[lang]

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('collini_products')
      .select('*')
      .order('name', { ascending: true })
    
    if (data) setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const t1 = parseFloat(currentTime)
    const d1 = parseFloat(currentThickness)
    const dTarget = parseFloat(targetThickness)

    if (t1 > 0 && d1 > 0 && dTarget > 0) {
      const totalTime = (t1 * dTarget) / d1
      const rest = Math.max(0, totalTime - t1)
      setRemainingTime(rest)
    } else {
      setRemainingTime(0)
    }
  }, [currentTime, currentThickness, targetThickness])

  const formatTime = (minutes) => {
    if (outputUnit === 'sec') {
      return { val: Math.round(minutes * 60), unit: t.unitSec }
    }
    if (outputUnit === 'hm') {
      const h = Math.floor(minutes / 60)
      const m = Math.round(minutes % 60)
      return { val: `${h}:${m.toString().padStart(2, '0')}`, unit: t.unitHourMin }
    }
    return { val: Math.round(minutes), unit: t.unitMin }
  }

  const saveProduct = async () => {
    if (!newProductName || !newProductSoll) return

    if (editingId) {
      // Update existing
      const { error } = await supabase
        .from('collini_products')
        .update({ name: newProductName, target_thickness: parseFloat(newProductSoll) })
        .eq('id', editingId)
      
      if (!error) {
        setEditingId(null)
        setNewProductName('')
        setNewProductSoll('')
        fetchProducts()
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('collini_products')
        .insert([{ name: newProductName, target_thickness: parseFloat(newProductSoll) }])
      
      if (!error) {
        setNewProductName('')
        setNewProductSoll('')
        fetchProducts()
      }
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setNewProductName(product.name)
    setNewProductSoll(product.target_thickness.toString())
  }

  const deleteProduct = async (id) => {
    const { error } = await supabase
      .from('collini_products')
      .delete()
      .eq('id', id)
    
    if (!error) fetchProducts()
  }

  const handleProductSelect = (e) => {
    const val = e.target.value
    if (val !== 'manual') {
      setTargetThickness(val)
    }
  }

  const { val: formattedVal, unit: formattedUnit } = formatTime(remainingTime)

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
        <img src={colliniLogo} alt="Collini Logo" className="header-logo" />
        <div className="subtitle">{t.title}</div>
        <div className="creator-credit">{t.createdBy}</div>
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
              <button className="add-btn" onClick={saveProduct}>
                {editingId ? t.updateProduct : t.saveProduct}
              </button>
              {editingId && (
                <button className="close-btn" onClick={() => {
                  setEditingId(null)
                  setNewProductName('')
                  setNewProductSoll('')
                }}>{t.close}</button>
              )}
            </div>
            {loading ? <p>{t.loading}</p> : (
              <div className="product-list">
                {products.map((p) => (
                  <div key={p.id} className="product-item">
                    <div className="product-info">
                      <strong>{p.name}</strong>
                      <span>{p.target_thickness} µm</span>
                    </div>
                    <div className="product-actions">
                      <button className="edit-btn" onClick={() => startEdit(p)}>{t.edit}</button>
                      <button className="delete-btn" onClick={() => deleteProduct(p.id)}>{t.delete}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {products.map((p) => (
                <option key={p.id} value={p.target_thickness}>{p.name}</option>
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
          <div className="unit-selector">
            <button className={outputUnit === 'min' ? 'active' : ''} onClick={() => setOutputUnit('min')}>{t.unitMin}</button>
            <button className={outputUnit === 'sec' ? 'active' : ''} onClick={() => setOutputUnit('sec')}>{t.unitSec}</button>
            <button className={outputUnit === 'hm' ? 'active' : ''} onClick={() => setOutputUnit('hm')}>{t.unitHourMin}</button>
          </div>
          <div className="result-label">{t.remainingTime}</div>
          <div className="result-value">
            {formattedVal}
            <span className="result-unit">{formattedUnit}</span>
          </div>
        </div>

        <div className="footer-info">
          <div className="info-item">
            <span className="info-label">{t.totalTime}</span>
            <span className="info-value">{Math.round(parseFloat(currentTime || 0) + remainingTime)} min</span>
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
