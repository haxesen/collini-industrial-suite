// Collini Schichtstärke Rechner - Production Build
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import colliniLogo from './assets/Collini_Logo.svg'
import { 
  Settings, RefreshCw, Save, Trash2, Edit2, X, 
  CheckCircle2, History, Calendar, Clock, FileText, 
  Lock, Unlock, AlertCircle, Printer 
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import './index.css'

const translations = {
  hu: {
    title: 'Rétegvastagság kalkulátor',
    batch: 'Sorszám',
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
    reset: 'Alaphelyzet',
    manualEntry: 'Kézi bevitel',
    loading: 'Betöltés...',
    saveResult: 'Eredmény mentése',
    saved: 'Mentve!',
    history: 'Előzmények',
    noHistory: 'Még nincsenek mentett adatok.',
    createdBy: 'Készítette: Horvát Tamás',
    adminLogin: 'Admin belépés',
    adminPass: 'Jelszó',
    login: 'Belépés',
    wrongPass: 'Hibás jelszó!',
    exportPdf: 'PDF Letöltés',
    print: 'Nyomtatás',
    printTitle: 'Számítási Jegyzőkönyv',
    pdfTitle: 'Mérési Jegyzökönyv',
    pdfBatch: 'Sorszám',
    pdfProduct: 'Termék',
    pdfResult: 'Hátralevő idö',
    pdfDate: 'Dátum',
    printDate: 'Dátum',
    printSignature: 'Aláírás'
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
    reset: 'Zurücksetzen',
    manualEntry: 'Manuelle Eingabe',
    loading: 'Laden...',
    saveResult: 'Ergebnis speichern',
    saved: 'Gespeichert!',
    history: 'Verlauf',
    noHistory: 'Noch keine Daten gespeichert.',
    createdBy: 'Erstellt von Tamas Horvát',
    adminLogin: 'Admin Login',
    adminPass: 'Passwort',
    login: 'Anmelden',
    wrongPass: 'Falsches Passwort!',
    exportPdf: 'PDF Export',
    print: 'Drucken',
    printTitle: 'Berechnungsprotokoll',
    pdfTitle: 'Messprotokoll',
    pdfBatch: 'Chargennummer',
    pdfProduct: 'Produkt',
    pdfResult: 'Restzeit',
    pdfDate: 'Datum',
    printDate: 'Datum',
    printSignature: 'Unterschrift'
  }
}

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('collini_lang') || 'hu')
  const [currentTime, setCurrentTime] = useState('120')
  const [currentThickness, setCurrentThickness] = useState('17.86')
  const [targetThickness, setTargetThickness] = useState('23')
  const [batchNumber, setBatchNumber] = useState('2604260007')
  const [remainingTime, setRemainingTime] = useState(0)
  const [outputUnit, setOutputUnit] = useState('min')
  
  // States
  const [products, setProducts] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManager, setShowManager] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPassInput, setAdminPassInput] = useState('')
  const [loginError, setLoginError] = useState(false)
  
  const [newProductName, setNewProductName] = useState('')
  const [newProductSoll, setNewProductSoll] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [selectedProductName, setSelectedProductName] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const t = translations[lang]

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('collini_products')
      .select('*')
      .order('name', { ascending: true })
    if (data) setProducts(data)
    setLoading(false)
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('collini_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setHistory(data)
  }

  useEffect(() => {
    localStorage.setItem('collini_lang', lang)
  }, [lang])

  useEffect(() => {
    fetchProducts()
    fetchHistory()
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

  const getStatusColor = (minutes) => {
    if (minutes <= 0) return 'gray'
    if (minutes <= 15) return 'status-green'
    if (minutes <= 45) return 'status-yellow'
    return 'status-blue'
  }

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

  const handleAdminLogin = () => {
    if (adminPassInput === 'Admin') {
      setIsAdmin(true)
      setShowAdminLogin(false)
      setAdminPassInput('')
      setLoginError(false)
    } else {
      setLoginError(true)
      setTimeout(() => setLoginError(false), 2000)
    }
  }

  const saveProduct = async () => {
    if (!newProductName || !newProductSoll) return
    if (editingId) {
      await supabase.from('collini_products').update({ name: newProductName, target_thickness: parseFloat(newProductSoll) }).eq('id', editingId)
      setEditingId(null)
    } else {
      await supabase.from('collini_products').insert([{ name: newProductName, target_thickness: parseFloat(newProductSoll) }])
    }
    setNewProductName('')
    setNewProductSoll('')
    fetchProducts()
  }

  const deleteProduct = async (id) => {
    await supabase.from('collini_products').delete().eq('id', id)
    fetchProducts()
  }

  const deleteHistory = async (id) => {
    await supabase.from('collini_history').delete().eq('id', id)
    fetchHistory()
  }

  const saveCalculation = async () => {
    if (!remainingTime) return
    const { error } = await supabase.from('collini_history').insert([{
      batch_number: batchNumber,
      product_name: selectedProductName || t.manualEntry,
      calculation_result: remainingTime
    }])
    if (!error) {
      setIsSaved(true)
      fetchHistory()
      setTimeout(() => setIsSaved(false), 3000)
    }
  }

  const generatePDF = (item) => {
    try {
      console.log('PDF generálás indítása...', item)
      const doc = new jsPDF()
      
      // Header
      doc.setFillColor(10, 12, 16)
      doc.rect(0, 0, 210, 40, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.text('COLLINI', 105, 20, { align: 'center' })
      doc.setFontSize(10)
      doc.text(t.pdfTitle, 105, 30, { align: 'center' })

      // Content
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      
      const tableData = [
        [t.pdfBatch, item.batch_number || '---'],
        [t.pdfProduct, item.product_name],
        [t.pdfResult, `${Math.round(item.calculation_result)} min`],
        [t.pdfDate, formatDate(item.created_at)]
      ]

      autoTable(doc, {
        startY: 50,
        head: [[t.pdfBatch, 'Adat']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 255] }
      })

      // Footer
      doc.setFontSize(10)
      doc.text(`Generálva: ${new Date().toLocaleString()}`, 10, 280)
      doc.text('Collini Wien GmbH - Quality Assurance', 200, 280, { align: 'right' })

      console.log('PDF mentése...')
      doc.save(`Collini_Protokoll_${item.batch_number || 'export'}.pdf`)
    } catch (error) {
      console.error('Hiba a PDF generálás során:', error)
      alert('Hiba történt a PDF generálása közben. Kérlek nézd meg a konzolt!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReset = () => {
    setCurrentTime(''); setCurrentThickness(''); setTargetThickness(''); setBatchNumber(''); setRemainingTime(0)
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'de-DE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const { val: formattedVal, unit: formattedUnit } = formatTime(remainingTime)
  const statusClass = getStatusColor(remainingTime)

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <div className="lang-toggle">
            <button className={lang === 'hu' ? 'active' : ''} onClick={() => setLang('hu')}>HU</button>
            <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
          </div>
          <div className="header-actions">
            <button className="icon-btn-header" onClick={() => setShowHistory(!showHistory)}>
              <History size={20} />
            </button>
            <button 
              className={`icon-btn-header ${isAdmin ? 'admin-active' : ''}`} 
              onClick={() => isAdmin ? setShowManager(!showManager) : setShowAdminLogin(true)}
            >
              {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          </div>
        </div>
        <img src={colliniLogo} alt="Collini Logo" className="header-logo" />
        <div className="subtitle">{t.title}</div>
        <div className="creator-credit">{t.createdBy}</div>
      </header>

      {showAdminLogin && (
        <div className="manager-overlay">
          <div className="manager-content login-content">
            <div className="manager-header">
              <h3>{t.adminLogin}</h3>
              <button className="icon-btn" onClick={() => setShowAdminLogin(false)}><X size={24} /></button>
            </div>
            <div className="product-form">
              <input 
                type="password" 
                placeholder={t.adminPass} 
                value={adminPassInput} 
                onChange={(e) => setAdminPassInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              {loginError && <div className="error-msg"><AlertCircle size={14} /> {t.wrongPass}</div>}
              <button className="add-btn" onClick={handleAdminLogin}>{t.login}</button>
            </div>
          </div>
        </div>
      )}

      {showManager && isAdmin && (
        <div className="manager-overlay">
          <div className="manager-content">
            <div className="manager-header">
              <h3>{t.manageProducts}</h3>
              <button className="icon-btn" onClick={() => setShowManager(false)}><X size={24} /></button>
            </div>
            <div className="product-form">
              <input type="text" placeholder={t.productName} value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
              <input type="number" placeholder={t.targetThickness} value={newProductSoll} onChange={(e) => setNewProductSoll(e.target.value)} />
              <button className="add-btn" onClick={saveProduct}>
                {editingId ? <><Edit2 size={16} /> {t.updateProduct}</> : <><Save size={16} /> {t.saveProduct}</>}
              </button>
            </div>
            <div className="product-list">
              {products.map((p) => (
                <div key={p.id} className="product-item">
                  <div className="product-info"><strong>{p.name}</strong><span>{p.target_thickness} µm</span></div>
                  <div className="product-actions">
                    <button className="edit-btn" onClick={() => {setEditingId(p.id); setNewProductName(p.name); setNewProductSoll(p.target_thickness.toString())}}><Edit2 size={14} /></button>
                    <button className="delete-btn" onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="manager-overlay">
          <div className="manager-content history-content">
            <div className="manager-header">
              <h3>{t.history}</h3>
              <button className="icon-btn" onClick={() => setShowHistory(false)}><X size={24} /></button>
            </div>
            <div className="history-list">
              {history.length === 0 ? <p>{t.noHistory}</p> : history.map((h) => (
                <div key={h.id} className="history-item">
                  <div className="history-main">
                    <div className="history-title">
                      <strong>{h.batch_number || '---'}</strong>
                      <span>{h.product_name}</span>
                    </div>
                    <div className="history-result">
                      {Math.round(h.calculation_result)} <small>min</small>
                    </div>
                  </div>
                  <div className="history-footer">
                    <div className="history-date"><Calendar size={12} /> {formatDate(h.created_at)}</div>
                    <div className="history-actions">
                      <button className="pdf-btn-small" onClick={() => generatePDF(h)}><FileText size={12} /></button>
                      {isAdmin && <button className="delete-btn-small" onClick={() => deleteHistory(h.id)}><Trash2 size={12} /></button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main>
        <div className="input-group">
          <label>{t.batch}</label>
          <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} />
        </div>

        <div className="input-group">
          <label>{t.selectProduct}</label>
          <select onChange={(e) => {
            const val = e.target.value
            if (val !== 'manual') {
              const product = products.find(p => p.target_thickness.toString() === val)
              setTargetThickness(val)
              setSelectedProductName(product ? product.name : '')
            } else { setTargetThickness(''); setSelectedProductName(t.manualEntry) }
          }} value={targetThickness || 'manual'}>
            <option value="manual">{t.manualEntry}</option>
            {products.map((p) => <option key={p.id} value={p.target_thickness}>{p.name}</option>)}
          </select>
        </div>

        <div className="input-group">
          <label>{t.currentTime}</label>
          <div className="input-wrapper">
            <input type="number" value={currentTime} onChange={(e) => setCurrentTime(e.target.value)} />
            <span className="unit">MIN</span>
          </div>
        </div>

        <div className="input-group">
          <label>{t.currentThickness}</label>
          <div className="input-wrapper">
            <input type="number" step="0.01" value={currentThickness} onChange={(e) => setCurrentThickness(e.target.value)} />
            <span className="unit">µm</span>
          </div>
        </div>

        <div className="input-group">
          <label>{t.targetThickness}</label>
          <div className="input-wrapper">
            <input type="number" step="0.1" value={targetThickness} onChange={(e) => setTargetThickness(e.target.value)} />
            <span className="unit">µm</span>
          </div>
        </div>

        <button className="reset-btn" onClick={handleReset}><RefreshCw size={18} /> {t.reset}</button>

        <div className={`result-card ${statusClass}`}>
          <div className="unit-selector">
            <button className={outputUnit === 'min' ? 'active' : ''} onClick={() => setOutputUnit('min')}>{t.unitMin}</button>
            <button className={outputUnit === 'sec' ? 'active' : ''} onClick={() => setOutputUnit('sec')}>{t.unitSec}</button>
            <button className={outputUnit === 'hm' ? 'active' : ''} onClick={() => setOutputUnit('hm')}>{t.unitHourMin}</button>
          </div>
          <div className="result-label">
            <Clock size={16} className="dynamic-icon" /> {t.remainingTime}
          </div>
          <div className="result-value">{formattedVal}<span className="result-unit">{formattedUnit}</span></div>
          <div className="result-actions">
            <button className={`save-result-btn ${isSaved ? 'saved' : ''}`} onClick={saveCalculation} disabled={isSaved || !remainingTime}>
              {isSaved ? <><CheckCircle2 size={18} /> {t.saved}</> : <><Save size={18} /> {t.saveResult}</>}
            </button>
            <button className="print-btn" onClick={handlePrint} disabled={!remainingTime}>
              <Printer size={18} /> {t.print}
            </button>
          </div>

          {/* Printable Area - Hidden on Screen */}
          <div className="printable-content">
            <div className="print-header">
              <img src={colliniLogo} alt="Collini" style={{height: '40px'}} />
              <h2>{t.printTitle}</h2>
            </div>
            <div className="print-grid">
              <div className="print-item"><strong>{t.batch}:</strong> {batchNumber}</div>
              <div className="print-item"><strong>{t.productName}:</strong> {selectedProductName || t.manualEntry}</div>
              <div className="print-item"><strong>{t.currentTime}:</strong> {currentTime} min</div>
              <div className="print-item"><strong>{t.currentThickness}:</strong> {currentThickness} µm</div>
              <div className="print-item"><strong>{t.targetThickness}:</strong> {targetThickness} µm</div>
            </div>
            <div className="print-result">
              <h3>{t.remainingTime}: {formattedVal} {formattedUnit}</h3>
            </div>
            <div className="print-footer">
              <p>{t.printDate}: {new Date().toLocaleString(lang === 'hu' ? 'hu-HU' : 'de-DE')}</p>
              <p>{t.printSignature}: ___________________________</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
