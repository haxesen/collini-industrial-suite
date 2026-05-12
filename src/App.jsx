import React, { useState, useEffect } from 'react'
import { 
  Calculator, RotateCcw, Save, History, Trash2, FileText, 
  Settings, Lock, Unlock, AlertCircle, CheckCircle2, ChevronLeft, 
  Printer, Clock, RefreshCw, Book, Search, Plus, Edit3, Edit2, 
  Megaphone, Hammer, BarChart3, ClipboardCheck, Calendar, X, Package
} from 'lucide-react'
import { supabase } from './supabase'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import colliniLogo from './assets/Collini_Logo.svg'

const translations = {
  hu: {
    title: 'RÉTEGVASTAGSÁG KALKULÁTOR',
    hubTitle: 'Industrial Suite',
    hubSub: 'Wählen Sie ein Modul',
    calculator: 'INDUSTRIAL SUITE',
    logbook: 'LOGBUCH (KS24)',
    infoWall: 'Infotafel',
    checklist: 'Checklista',
    prodPlan: 'ProduktionPlan',
    wartungsplaner: 'Wartungsplaner',
    calcDesc: 'Rétegvastagság és maradékidő számítás',
    logbookDesc: 'Eseménynapló és hibabejelentő',
    infoWallDesc: 'Fontos üzemi információk és hirdetmények',
    checklistDesc: 'Műszakátvételi ellenőrző lista',
    prodPlanDesc: 'Aktuális termelési terv szerkesztése',
    wartungsplanerDesc: 'Gépkarbantartási ütemterv',
    comingSoon: 'Fejlesztés alatt',
    batch: 'Sorszám',
    currentTime: 'Kifűtési idő (Liegezeit)',
    currentThickness: 'Kifűtési mérés (Dicke)',
    targetThickness: 'Cél vastagság (Soll)',
    remainingTime: 'HÁTRALÉVŐ IDŐ',
    unitMin: 'perc',
    unitSec: 'mp',
    unitMicron: 'µm',
    unitHourMin: 'ó:p',
    reset: 'Alaphelyzet',
    saveResult: 'Eredmény mentése',
    saved: 'Mentve!',
    history: 'Előzmények',
    noHistory: 'Nincsenek korábbi számítások',
    exportPdf: 'PDF export',
    adminLogin: 'Adminisztrátori belépés',
    adminPass: 'Jelszó',
    login: 'Belépés',
    wrongPass: 'Hibás jelszó!',
    manageProducts: 'Termékek kezelése',
    productName: 'Termék neve',
    saveProduct: 'Termék mentése',
    updateProduct: 'Termék frissítése',
    selectProduct: 'Válassz terméket...',
    manualEntry: 'Kézi bevitel',
    back: 'Vissza',
    createdBy: 'KÉSZÍTETTE: HORVÁTH TAMÁS',
    search: 'Keresés...',
    allStatus: 'Összes státusz',
    allPrio: 'Összes prioritás',
    allDept: 'Összes részleg',
    open: 'NYITOTT',
    done: 'BEFEJEZVE',
    inProgress: 'FOLYAMATBAN',
    kritisch: 'KRITIKUS',
    hoch: 'MAGAS',
    mittel: 'KÖZEPES',
    prio: 'PRIORITÁS',
    dept: 'RÉSZLEG',
    problem: 'PROBLÉMA / INFÓ',
    erfasser: 'RÖGZÍTŐ',
    action: 'INTÉZKEDÉS',
    who: 'FELELŐS',
    status: 'STÁTUSZ',
    isNew: 'ÚJ',
    startWork: 'MUNKA MEGKEZDÉSE',
    finishTime: 'BEFEJEZÉS IDEJE',
    completedBy: 'KÉSZÍTETTE',
    addEntry: 'Új bejegyzés',
    newEntry: 'Új bejegyzés',
    edit: 'Szerkesztés',
    save: 'Mentés',
    delete: 'Törlés',
    printDate: 'DÁTUM',
    printTitle: 'Mérési Jegyzőkönyv',
    printSignature: 'Aláírás',
    print: 'Nyomtatás',
    depts: 'Részlegek',
    mechs: 'Karbantartók',
    ops: 'Anlagenführerek',
    short: 'Rövidítés',
    desc: 'Megnevezés'
  },
  de: {
    title: 'INDUSTRIAL SUITE',
    hubTitle: 'Industrial Suite',
    hubSub: 'Wählen Sie ein Modul',
    calculator: 'INDUSTRIAL SUITE',
    logbook: 'LOGBUCH (KS24)',
    infoWall: 'Infotafel',
    checklist: 'Checkliste',
    prodPlan: 'ProduktionsPlan',
    wartungsplaner: 'Wartungsplaner',
    calcDesc: 'Schichtdicke und Restzeitberechnung',
    logbookDesc: 'Ereignisprotokoll und Fehlerberichterstattung',
    infoWallDesc: 'Wichtige Betriebsinformationen und Ankündigungen',
    checklistDesc: 'Schichtübergabe-Checkliste',
    prodPlanDesc: 'Aktuellen Produktionsplan bearbeiten',
    wartungsplanerDesc: 'Maschinenwartungsplan',
    comingSoon: 'In Entwicklung',
    batch: 'Chargennummer',
    currentTime: 'Liegezeit (Zwischenm.)',
    currentThickness: 'Dicke (Zwischenm.)',
    targetThickness: 'Soll-Schichtdicke',
    remainingTime: 'REST-LIEGEZEIT',
    unitMin: 'min',
    unitSec: 'sek',
    unitMicron: 'µm',
    unitHourMin: 'h:m',
    reset: 'Zurücksetzen',
    print: 'Drucken',
    saveResult: 'Ergebnis speichern',
    saved: 'Gespeichert!',
    history: 'Verlauf',
    noHistory: 'Keine vorherigen Berechnungen',
    exportPdf: 'PDF Export',
    adminLogin: 'Administrator-Login',
    adminPass: 'Passwort',
    login: 'Login',
    wrongPass: 'Falsches Passwort!',
    manageProducts: 'Produkte verwalten',
    productName: 'Produktname',
    saveProduct: 'Produkt speichern',
    updateProduct: 'Produkt aktualisieren',
    selectProduct: 'Produkt wählen...',
    manualEntry: 'Manuelle Eingabe',
    back: 'Zurück',
    createdBy: 'ERSTELLT VON TAMÁS HORVÁTH',
    search: 'Suche...',
    allStatus: 'Alle Status',
    allPrio: 'Alle Prioritäten',
    allDept: 'Alle Abteilungen',
    open: 'OFFEN',
    done: 'ERLEDIGT',
    inProgress: 'IN ARBEIT',
    kritisch: 'KRITISCH',
    hoch: 'HOCH',
    mittel: 'MITTEL',
    prio: 'PRIORITÄT',
    dept: 'ABTEILUNG',
    problem: 'PROBLEM / INFO',
    erfasser: 'ERSTELLER',
    action: 'MAßNAHME',
    who: 'ZUSTÄNDIG',
    status: 'STATUS',
    isNew: 'NEU',
    startWork: 'ARBEITSBEGINN',
    finishTime: 'ABSCHLUSSZEIT',
    completedBy: 'ABGESCHLOSSEN VON',
    addEntry: 'Neuer Eintrag',
    newEntry: 'Neuer Eintrag',
    edit: 'Bearbeiten',
    save: 'Speichern',
    delete: 'Löschen',
    printDate: 'DATUM',
    printTitle: 'Messprotokoll',
    printSignature: 'Unterschrift',
    depts: 'Abteilungen',
    mechs: 'Instandhaltung',
    ops: 'Anlagenführer',
    short: 'Kürzel',
    desc: 'Bezeichnung'
  }
}

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('collini_lang') || 'de')
  const [view, setView] = useState('hub')
  
  // Calculator states
  const [currentTime, setCurrentTime] = useState('120')
  const [currentThickness, setCurrentThickness] = useState('17.86')
  const [targetThickness, setTargetThickness] = useState('23')
  const [batchNumber, setBatchNumber] = useState('')
  const [remainingTime, setRemainingTime] = useState(0)
  const [outputUnit, setOutputUnit] = useState('min')
  const [products, setProducts] = useState([])
  const [selectedProductName, setSelectedProductName] = useState('')
  const [history, setHistory] = useState([])
  const [isSaved, setIsSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  // Admin states
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminPassInput, setAdminPassInput] = useState('')
  const [loginError, setLoginError] = useState(false)
  const [showManager, setShowManager] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductSoll, setNewProductSoll] = useState('')
  const [editingId, setEditingId] = useState(null)
  
  // Logbook states
  const [logEntries, setLogEntries] = useState([])
  const [logbookConfig, setLogbookConfig] = useState([])
  const [showLogEntryModal, setShowLogEntryModal] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [finishingEntryId, setFinishingEntryId] = useState(null)
  const [logSearch, setLogSearch] = useState('')
  const [logFilterStatus, setLogFilterStatus] = useState('All')
  const [logFilterPrio, setLogFilterPrio] = useState('All')
  const [logFilterDept, setLogFilterDept] = useState('All')
  const [logSortConfig, setLogSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [editingLogId, setEditingLogId] = useState(null)
  const [newLogEntry, setNewLogEntry] = useState({
    problem_info: '',
    erfasser: '',
    prio: '4_info',
    abteilung: 'PR',
    massnahme: '',
    status: '1_Offen',
    wer_ist_dran: '',
    is_new: true
  })
  
  // Info Wall states
  const [activeInfos, setActiveInfos] = useState([])
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [editingInfoId, setEditingInfoId] = useState(null)
  const [newInfoEntry, setNewInfoEntry] = useState({
    message: '',
    department: 'PRODUKTION',
    priority: 'normal',
    author: '',
    expires_at: ''
  })

  const t = translations[lang]

  useEffect(() => {
    localStorage.setItem('collini_lang', lang)
  }, [lang])

  useEffect(() => {
    if (view === 'hub' || view === 'logbook' || view === 'info_wall') {
      document.body.classList.add('wide-layout')
    } else {
      document.body.classList.remove('wide-layout')
    }
  }, [view])

  useEffect(() => {
    fetchProducts()
    fetchHistory()
    fetchLogbook()
    fetchLogbookConfig()
    fetchActiveInfos()

    const subscription = supabase
      .channel('info_wall_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collini_info_wall' }, payload => {
        fetchActiveInfos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [])

  const fetchActiveInfos = async () => {
    const { data } = await supabase
      .from('collini_info_wall')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setActiveInfos(data);
  };

  const saveInfoEntry = async () => {
    if (!newInfoEntry.message || !newInfoEntry.author) return;
    
    const payload = { ...newInfoEntry };
    if (!payload.expires_at) delete payload.expires_at;

    if (editingInfoId) {
      const { error } = await supabase
        .from('collini_info_wall')
        .update(payload)
        .eq('id', editingInfoId);
      if (!error) {
        setEditingInfoId(null); setShowInfoModal(false); fetchActiveInfos();
      }
    } else {
      const { error } = await supabase
        .from('collini_info_wall')
        .insert([payload]);
      if (!error) {
        setShowInfoModal(false); fetchActiveInfos();
      }
    }
    setNewInfoEntry({ message: '', department: 'PRODUKTION', priority: 'normal', author: '', expires_at: '' });
  };

  const deleteInfoEntry = async (id) => {
    const { error } = await supabase.from('collini_info_wall').delete().eq('id', id);
    if (!error) fetchActiveInfos();
  };

  const startEditInfo = (info) => {
    setEditingInfoId(info.id);
    setNewInfoEntry({
      message: info.message,
      department: info.department,
      priority: info.priority,
      author: info.author,
      expires_at: info.expires_at || ''
    });
    setShowInfoModal(true);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('collini_products')
      .select('*')
      .order('name', { ascending: true })
    if (data) setProducts(data)
  }

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('collini_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setHistory(data)
  }

  const fetchLogbook = async () => {
    const { data } = await supabase
      .from('logbook')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLogEntries(data)
  }

  const fetchLogbookConfig = async () => {
    const { data } = await supabase
      .from('collini_logbook_config')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) setLogbookConfig(data)
  }

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

  const saveConfigItem = async (type, value, label = null) => {
    const { error } = await supabase
      .from('collini_logbook_config')
      .insert([{ type, value, label }])
    if (!error) fetchLogbookConfig()
  }

  const deleteConfigItem = async (id) => {
    const { error } = await supabase
      .from('collini_logbook_config')
      .delete()
      .eq('id', id)
    if (!error) fetchLogbookConfig()
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

  const saveLogEntry = async () => {
    if (!newLogEntry.problem_info || !newLogEntry.erfasser) return
    
    if (editingLogId) {
      const { error } = await supabase
        .from('logbook')
        .update({
          problem_info: newLogEntry.problem_info,
          erfasser: newLogEntry.erfasser,
          prio: newLogEntry.prio,
          abteilung: newLogEntry.abteilung,
          massnahme: newLogEntry.massnahme,
          wer_ist_dran: newLogEntry.wer_ist_dran
        })
        .eq('id', editingLogId)
      if (!error) {
        setEditingLogId(null); setShowLogEntryModal(false); fetchLogbook()
      }
    } else {
      const { error } = await supabase.from('logbook').insert([newLogEntry])
      if (!error) {
        setShowLogEntryModal(false); fetchLogbook()
      }
    }
  }

  const startEditLog = (entry) => {
    setEditingLogId(entry.id)
    setNewLogEntry({
      problem_info: entry.problem_info,
      erfasser: entry.erfasser,
      prio: entry.prio,
      abteilung: entry.abteilung,
      massnahme: entry.massnahme,
      wer_ist_dran: entry.wer_ist_dran,
      status: entry.status,
      is_new: entry.is_new
    })
    setShowLogEntryModal(true)
  }

  const quickUpdateLog = async (id, field, value) => {
    const updateData = { [field]: value };
    if (field === 'in_arbeit_ab') {
      updateData.status = '2_In_Arbeit';
      updateData.is_new = false;
    }
    if (field === 'erledigt_am') {
      setFinishingEntryId(id); setShowFinishModal(true); return;
    }

    const { error } = await supabase.from('logbook').update(updateData).eq('id', id)
    if (!error) fetchLogbook()
  }

  const finalizeRepair = async (name) => {
    if (!finishingEntryId || !name) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    const { error } = await supabase
      .from('logbook')
      .update({
        erledigt_am: now.toISOString(),
        erledigt_von: name,
        status: '3_Erledigt',
        is_new: false
      })
      .eq('id', finishingEntryId)
    
    if (!error) {
      setShowFinishModal(false); setFinishingEntryId(null); fetchLogbook();
    }
  }

  const getPrioLabel = (prio) => {
    if (prio === '0_kritisch') return t.kritisch.toUpperCase()
    if (prio === '1_hoch') return t.hoch.toUpperCase()
    if (prio === '2_mittel') return t.mittel.toUpperCase()
    return 'INFO'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '---'
    const d = new Date(dateStr)
    return d.toLocaleDateString(lang === 'hu' ? 'hu-HU' : 'de-DE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const handlePrint = () => window.print()
  const handleReset = () => {
    setCurrentTime(''); setCurrentThickness(''); setTargetThickness(''); setBatchNumber(''); setRemainingTime(0)
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (logSortConfig.key === key && logSortConfig.direction === 'asc') direction = 'desc';
    setLogSortConfig({ key, direction });
  }

  const resetFilters = () => {
    setLogSearch(''); setLogFilterStatus('All'); setLogFilterPrio('All'); setLogFilterDept('All')
  }

  const filteredAndSortedEntries = logEntries
    .filter(entry => {
      const matchesSearch = entry.problem_info.toLowerCase().includes(logSearch.toLowerCase()) || 
                           entry.erfasser.toLowerCase().includes(logSearch.toLowerCase());
      const matchesStatus = logFilterStatus === 'All' || entry.status === logFilterStatus;
      const matchesPrio = logFilterPrio === 'All' || entry.prio === logFilterPrio;
      const matchesDept = logFilterDept === 'All' || entry.abteilung === logFilterDept;
      return matchesSearch && matchesStatus && matchesPrio && matchesDept;
    })
    .sort((a, b) => {
      let aVal = a[logSortConfig.key] || '';
      let bVal = b[logSortConfig.key] || '';
      if (logSortConfig.key === 'created_at') {
        aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return logSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return logSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const generatePDF = (item) => {
    const doc = new jsPDF()
    doc.setFillColor(10, 12, 16); doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('COLLINI', 105, 20, { align: 'center' })
    doc.setFontSize(10); doc.text(t.printTitle, 105, 30, { align: 'center' })
    doc.setTextColor(0, 0, 0); doc.setFontSize(12)
    const tableData = [
      [t.batch, item.batch_number || '---'],
      [t.productName, item.product_name],
      [t.remainingTime, `${Math.round(item.calculation_result)} min`],
      [t.printDate, formatDate(item.created_at)]
    ]
    autoTable(doc, {
      startY: 50,
      head: [[t.batch, 'Data']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 255] }
    })
    doc.save(`Collini_${item.batch_number || 'export'}.pdf`)
  }

  const getDeptDisplay = (dept) => {
    const mapping = {
      'TERMELÉS': 'PRODUKTION',
      'KARBANTARTÁS': 'INSTANDHALTUNG',
      'MINŐSÉG': 'QUALITÄT',
      'LOGISZTIKA': 'LOGISTIK',
      'PRODUCTION': 'PRODUKTION',
      'MAINTENANCE': 'INSTANDHALTUNG'
    };
    return mapping[dept.toUpperCase()] || dept;
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const GlobalTicker = () => {
    if (activeInfos.length === 0) return null;
    return (
      <div className="global-ticker-container">
        <div className="ticker-content">
          {activeInfos.map((info, idx) => (
            <div key={info.id} className={`ticker-item priority-${info.priority}`}>
              <span className="ticker-dept">[{getDeptDisplay(info.department)}]</span>
              <span className="ticker-msg">{stripHtml(info.message)}</span>
              {idx < activeInfos.length - 1 && <span className="ticker-separator">•</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const { val: formattedVal, unit: formattedUnit } = formatTime(remainingTime)
  const statusClass = getStatusColor(remainingTime)

  const renderView = () => {
    switch(view) {
      case 'hub':
        return (
          <div className="hub-container">

            <header className="hub-header">
              <div className="hub-title">
                <img src={colliniLogo} alt="Collini" className="hub-logo" />
                <h1>{t.hubTitle}</h1>
                <p style={{color: 'var(--text-secondary)'}}>{t.hubSub}</p>
              </div>
            </header>
            
            <div className="hub-grid">
              <div className="hub-card" onClick={() => setView('calculator')}>
                <div className="hub-card-icon"><Calculator size={60} /></div>
                <h2>{t.calculator}</h2>
                <p>{t.calcDesc}</p>
              </div>
              <div className="hub-card" onClick={() => setView('logbook')}>
                <div className="hub-card-icon"><Book size={60} /></div>
                <h2>{t.logbook}</h2>
                <p>{t.logbookDesc}</p>
              </div>
              <div className="hub-card disabled">
                <div className="coming-soon-badge">{t.comingSoon}</div>
                <div className="hub-card-icon"><ClipboardCheck size={60} /></div>
                <h2>{t.checklist}</h2>
                <p>{t.checklistDesc}</p>
              </div>
              <div className="hub-card" onClick={() => setView('info_wall')}>
                <div className="hub-card-icon"><Megaphone size={60} /></div>
                <h2>{t.infoWall}</h2>
                <p>{t.infoWallDesc}</p>
              </div>
              <div className="hub-card disabled">
                <div className="coming-soon-badge">{t.comingSoon}</div>
                <div className="hub-card-icon"><BarChart3 size={60} /></div>
                <h2>{t.prodPlan}</h2>
                <p>{t.prodPlanDesc}</p>
              </div>
              <div className="hub-card disabled">
                <div className="coming-soon-badge">{t.comingSoon}</div>
                <div className="hub-card-icon"><Hammer size={60} /></div>
                <h2>{t.wartungsplaner}</h2>
                <p>{t.wartungsplanerDesc}</p>
              </div>
            </div>

            <div className="lang-toggle" style={{marginTop: '20px'}}>
              <button className={lang === 'hu' ? 'active' : ''} onClick={() => setLang('hu')}>HU</button>
              <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
            </div>
            <div className="creator-credit" style={{marginTop: 'auto'}}>{t.createdBy}</div>
          </div>
        );

      case 'calculator':
        return (
          <div className="app-container">
            <header className="classic-header">
              <div className="header-top-classic">
                <button className="back-btn" onClick={() => setView('hub')}>
                  <ChevronLeft size={20} /> {t.back}
                </button>
                <div className="lang-toggle-header">
                  <button className={lang === 'hu' ? 'active' : ''} onClick={() => setLang('hu')}>HU</button>
                  <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
                </div>
                <div className="header-actions">
                  <button className="icon-btn-header" onClick={() => setShowHistory(true)}><History size={20} /></button>
                  <button className={`icon-btn-header ${isAdmin ? 'admin-active' : ''}`} onClick={() => setShowAdmin(!isAdmin)}><Lock size={20} /></button>
                </div>
              </div>
              <div className="logo-section">
                <img src={colliniLogo} alt="Collini" className="header-logo" />
                <h2 className="classic-title">{t.title}</h2>
                <p className="classic-subtitle">{t.createdBy}</p>
              </div>
            </header>

            <main className="calculator-main">
              <div className="input-group">
                <label>{t.batch}</label>
                <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="PL999..." />
              </div>

              <div className="input-group">
                <label>{t.productName}</label>
                <select value={selectedProductName} onChange={(e) => {
                  const p = products.find(x => x.name === e.target.value);
                  setSelectedProductName(e.target.value);
                  if(p) setTargetThickness(p.target_thickness.toString());
                }}>
                  <option value="">{t.selectProduct}</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>{t.currentTime} ({t.unitMin})</label>
                  <input type="number" value={currentTime} onChange={(e) => setCurrentTime(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>{t.currentThickness} ({t.unitMicron})</label>
                  <input type="number" value={currentThickness} onChange={(e) => setCurrentThickness(e.target.value)} />
                </div>
              </div>

              <div className="input-group">
                <label>{t.targetThickness} ({t.unitMicron})</label>
                <div className="input-wrapper">
                  <input type="number" value={targetThickness} onChange={(e) => setTargetThickness(e.target.value)} />
                  <span className="unit">µm</span>
                </div>
              </div>

              <button className="reset-btn-classic" onClick={handleReset}><RotateCcw size={16} /> {t.reset}</button>

              <div className={`result-card status-yellow`}>
                <div className="unit-selector">
                  <button className={outputUnit === 'min' ? 'active' : ''} onClick={() => setOutputUnit('min')}>{t.unitMin}</button>
                  <button className={outputUnit === 'sec' ? 'active' : ''} onClick={() => setOutputUnit('sec')}>{t.unitSec}</button>
                  <button className={outputUnit === 'hm' ? 'active' : ''} onClick={() => setOutputUnit('hm')}>{t.unitHourMin}</button>
                </div>
                <div className="result-label-classic">
                   <Clock size={16} className="dynamic-icon" /> {t.remainingTime}
                </div>
                <div className="result-value">
                  {formattedVal} <span className="result-unit-classic">{formattedUnit}</span>
                </div>
                
                <div className="result-actions">
                  <button className="save-result-btn" onClick={saveCalculation} disabled={isSaved}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <Save size={18} />
                      <span style={{fontSize: '0.7rem'}}>{t.saveResult}</span>
                    </div>
                  </button>
                  <button className="print-btn" onClick={() => window.print()}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                      <Printer size={18} />
                      <span style={{fontSize: '0.7rem'}}>{t.print}</span>
                    </div>
                  </button>
                </div>
              </div>
            </main>
          </div>
        );

      case 'logbook':
        return (
          <div className="app-container">
            <header>
              <div className="header-top">
                <button className="back-btn" onClick={() => setView('hub')}>
                  <ChevronLeft size={20} /> {t.back}
                </button>
                <div className="lang-toggle-header">
                  <button className={lang === 'hu' ? 'active' : ''} onClick={() => setLang('hu')}>HU</button>
                  <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
                </div>
                <div className="header-actions">
                  {isAdmin && (
                    <button className="icon-btn-header" onClick={() => setShowManager(true)}>
                      <Settings size={20} />
                    </button>
                  )}
                  <button 
                    className={`icon-btn-header ${isAdmin ? 'admin-active' : ''}`} 
                    onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
                  >
                    {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
                  </button>
                </div>
              </div>
              <img src={colliniLogo} alt="Collini Logo" className="header-logo" />
              <div className="subtitle">{t.logbook}</div>
            </header>

            <main className="logbook-main">
              <div className="logbook-header">
                <div className="logbook-controls">
                  <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder={t.search} value={logSearch} onChange={(e) => setLogSearch(e.target.value)} />
                  </div>
                  <select className="filter-select" value={logFilterStatus} onChange={(e) => setLogFilterStatus(e.target.value)}>
                    <option value="All">{t.allStatus}</option>
                    <option value="1_Offen">{t.open}</option>
                    <option value="2_In_Arbeit">{t.inProgress}</option>
                    <option value="3_Erledigt">{t.done}</option>
                  </select>
                  <select className="filter-select" value={logFilterPrio} onChange={(e) => setLogFilterPrio(e.target.value)}>
                    <option value="All">{t.allPrio}</option>
                    <option value="0_kritisch">{t.kritisch}</option>
                    <option value="1_hoch">{t.hoch}</option>
                    <option value="2_mittel">{t.mittel}</option>
                    <option value="4_info">INFO</option>
                  </select>
                  <select className="filter-select" value={logFilterDept} onChange={(e) => setLogFilterDept(e.target.value)}>
                    <option value="All">{t.allDept}</option>
                    {logbookConfig.filter(c => c.type === 'dept').map(d => (
                      <option key={d.id} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <button className="reset-filters-btn" onClick={resetFilters}><RotateCcw size={16} /></button>
                </div>
                <button className="add-entry-btn-premium" onClick={() => { setEditingLogId(null); setNewLogEntry({ problem_info: '', erfasser: '', prio: '2_mittel', abteilung: 'PR', massnahme: '', status: '1_Offen', is_new: true }); setShowLogEntryModal(true); }}>
                  <Plus size={18} /> {t.addEntry}
                </button>
              </div>

              <div className="logbook-table-container">
                <table className="logbook-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('created_at')} className="sortable">{t.printDate} {logSortConfig.key === 'created_at' && (logSortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                      <th style={{ width: '40px' }}>{t.isNew}</th>
                      <th>{t.problem}</th>
                      <th>{t.erfasser}</th>
                      <th onClick={() => handleSort('prio')} className="sortable">{t.prio}</th>
                      <th>{t.dept}</th>
                      <th>{t.who}</th>
                      <th>{t.action}</th>
                      <th>{t.startWork}</th>
                      <th>{t.finishTime}</th>
                      <th>{t.status}</th>
                      <th>{t.completedBy}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedEntries.map(entry => (
                      <tr key={entry.id} className={`row-prio-${entry.prio.split('_')[1] || entry.prio} row-status-${entry.status.split('_').slice(1).join('_').toLowerCase()}`}>
                        <td className="col-date">{formatDate(entry.created_at)}</td>
                        <td className="col-new">
                          {entry.is_new && <span className="new-dot"></span>}
                        </td>
                        <td className="col-problem">
                          <div className="problem-text">{entry.problem_info}</div>
                        </td>
                        <td className="col-erfasser">{entry.erfasser}</td>
                        <td className="col-prio">
                          <span className={`prio-badge ${entry.prio.split('_')[1] || entry.prio}`}>
                            {getPrioLabel(entry.prio)}
                          </span>
                        </td>
                        <td className="col-dept">{entry.abteilung}</td>
                        <td className="col-who">
                          {entry.status === '1_Offen' ? (
                            <button className="small-btn" onClick={() => quickUpdateLog(entry.id, 'in_arbeit_ab', new Date().toISOString())}>START</button>
                          ) : (
                            <span className="worker-name">{entry.wer_ist_dran || '---'}</span>
                          )}
                        </td>
                        <td className="col-action">
                          {entry.massnahme || '---'}
                        </td>
                        <td className="col-start-time">{formatDate(entry.in_arbeit_ab)}</td>
                        <td className="col-end-time">
                          {entry.status === '2_In_Arbeit' ? (
                            <button className="small-btn done" onClick={() => quickUpdateLog(entry.id, 'erledigt_am', new Date().toISOString())}>KÉSZ</button>
                          ) : (
                            formatDate(entry.erledigt_am)
                          )}
                        </td>
                        <td className="col-status">
                          <div className={`status-badge-container ${entry.status.split('_').slice(1).join('_').toLowerCase()}`}>
                            {entry.status === '1_Offen' ? t.open : entry.status === '2_In_Arbeit' ? t.inProgress : t.done}
                          </div>
                        </td>
                        <td className="col-completed-by">{entry.erledigt_von || '---'}</td>
                        <td className="col-edit">
                          <button className="edit-icon-btn" onClick={() => startEditLog(entry)}><Edit3 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </main>
          </div>
        );

      case 'info_wall':
        return (
          <div className="app-container">
            <header>
              <div className="header-top">
                <button className="back-btn" onClick={() => setView('hub')}>
                  <ChevronLeft size={20} /> {t.back}
                </button>
                <div className="header-actions">
                  {isAdmin && (
                    <button className="add-entry-btn-premium" onClick={() => {setEditingInfoId(null); setNewInfoEntry({message: '', department: 'PRODUKTION', priority: 'normal', author: '', expires_at: ''}); setShowInfoModal(true)}}>
                      <Plus size={20} /> {lang === 'hu' ? 'ÚJ ÜZENET' : 'NEUE INFO'}
                    </button>
                  )}
                  <button 
                    className={`icon-btn-header ${isAdmin ? 'admin-active' : ''}`} 
                    onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
                  >
                    {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
                  </button>
                </div>
              </div>
              <img src={colliniLogo} alt="Collini Logo" className="header-logo" />
              <div className="subtitle">{t.infoWall}</div>
            </header>
            <main>
              <div className="info-wall-grid">
                {activeInfos.length === 0 ? (
                  <div className="empty-msg" style={{gridColumn: '1/-1'}}>{lang === 'hu' ? 'Nincsenek aktív üzenetek.' : 'Keine aktiven Nachrichten.'}</div>
                ) : (
                  activeInfos.map(info => (
                    <div key={info.id} className={`info-card priority-${info.priority}`}>
                      <div className="info-card-header">
                        <span className="info-dept">{info.author}</span>
                        <span className="info-date">{formatDate(info.created_at)}</span>
                      </div>
                      <div className="info-card-body">
                         <div dangerouslySetInnerHTML={{ __html: info.message }} />
                      </div>
                      <div className="info-card-footer">
                         <span className="info-author">{getDeptDisplay(info.department)}</span>
                        {isAdmin && (
                          <div className="info-card-actions">
                            <button className="info-action-btn" onClick={() => startEditInfo(info)}><Edit3 size={16} /></button>
                            <button className="info-action-btn delete" onClick={() => deleteInfoEntry(info.id)}><Trash2 size={16} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </main>
          </div>
        );

      default:
        return <div>View not found</div>;
    }
  };


  return (
    <div className="full-view-wrapper">
      <GlobalTicker />
      {renderView()}

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

      {showLogEntryModal && (
        <div className="manager-overlay">
          <div className="manager-content" style={{maxWidth: '600px', width: '95%'}}>
            <div className="manager-header">
              <h3>{editingLogId ? t.edit : t.addEntry}</h3>
              <button className="icon-btn" onClick={() => setShowLogEntryModal(false)}><X size={24} /></button>
            </div>
            <div className="product-form">
              <div className="input-group">
                <label>{t.problem}</label>
                <textarea 
                  value={newLogEntry.problem_info} 
                  onChange={(e) => setNewLogEntry({...newLogEntry, problem_info: e.target.value})}
                  rows={3}
                />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="log-input-group">
                  <label>{t.erfasser}</label>
                  <select 
                    className="log-input"
                    value={newLogEntry.erfasser}
                    onChange={(e) => setNewLogEntry({...newLogEntry, erfasser: e.target.value})}
                  >
                    <option value="">{lang === 'hu' ? 'Válassz nevet...' : 'Name wählen...'}</option>
                    {logbookConfig.filter(c => c.type === 'operator').map(op => (
                      <option key={op.id} value={op.label}>{op.label}</option>
                    ))}
                  </select>
                </div>
                <div className="log-input-group">
                  <label>{t.prio}</label>
                  <select 
                    className="log-input"
                    value={newLogEntry.prio}
                    onChange={(e) => setNewLogEntry({...newLogEntry, prio: e.target.value})}
                  >
                    <option value="0_kritisch">{t.kritisch}</option>
                    <option value="1_hoch">{t.hoch}</option>
                    <option value="2_mittel">{t.mittel}</option>
                    <option value="4_info">INFO</option>
                  </select>
                </div>
              </div>
              <div className="log-input-group">
                <label>{t.dept}</label>
                <select 
                  className="log-input"
                  value={newLogEntry.abteilung}
                  onChange={(e) => setNewLogEntry({...newLogEntry, abteilung: e.target.value})}
                >
                  {logbookConfig.filter(c => c.type === 'dept').map(d => (
                    <option key={d.id} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <button className="add-btn" onClick={saveLogEntry}>{t.save}</button>
            </div>
          </div>
        </div>
      )}

      {showManager && isAdmin && (
        <div className="manager-overlay">
          <div className="manager-content wide-manager">
            <div className="manager-header">
              <h2>{lang === 'hu' ? 'Adminisztrációs Vezérlőpult' : 'Admin Dashboard'}</h2>
              <button className="icon-btn" onClick={() => setShowManager(false)}><X size={24} /></button>
            </div>
            <div className="admin-grid">
              <div className="admin-card">
                <h3>{t.manageProducts}</h3>
                <div className="product-form">
                  <input type="text" placeholder={t.productName} value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                  <input type="number" placeholder={t.targetThickness} value={newProductSoll} onChange={(e) => setNewProductSoll(e.target.value)} />
                  <button className="add-btn" onClick={saveProduct}>
                    {editingId ? t.updateProduct : t.saveProduct}
                  </button>
                </div>
                <div className="product-list">
                  {products.map((p) => (
                    <div key={p.id} className="product-item">
                      <span>{p.name} ({p.target_thickness} µm)</span>
                      <div className="product-actions">
                        <button className="edit-btn" onClick={() => {setEditingId(p.id); setNewProductName(p.name); setNewProductSoll(p.target_thickness.toString())}}><Edit2 size={14} /></button>
                        <button className="delete-btn" onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <h3>{t.logbook} {t.settings}</h3>
                <div className="config-grid">
                  <div>
                    <h4>{t.depts}</h4>
                    <div className="config-list">
                      {logbookConfig.filter(c => c.type === 'dept').map(item => (
                        <div key={item.id} className="config-item">
                          <span>{item.label} ({item.value})</span>
                          <button onClick={() => deleteConfigItem(item.id)}><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4>{t.mechs}</h4>
                    <div className="config-list">
                      {logbookConfig.filter(c => c.type === 'mech').map(item => (
                        <div key={item.id} className="config-item">
                          <span>{item.label}</span>
                          <button onClick={() => deleteConfigItem(item.id)}><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFinishModal && (
        <div className="manager-overlay">
          <div className="manager-content" style={{maxWidth: '450px', width: '90%'}}>
            <div className="manager-header">
              <h3>{lang === 'hu' ? 'Javítás lezárása' : 'Reparatur abschließen'}</h3>
              <button className="icon-btn" onClick={() => setShowFinishModal(false)}><X size={24} /></button>
            </div>
            <div className="finish-name-list">
              {logbookConfig.filter(c => c.type === 'mech' || c.type === 'operator').map(person => (
                <button 
                  key={person.id} 
                  className="finish-name-btn"
                  onClick={() => finalizeRepair(person.label)}
                >
                  {person.label}
                </button>
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
                    <strong>{h.batch_number || '---'}</strong> - {h.product_name} ({Math.round(h.calculation_result)} min)
                  </div>
                  <div className="history-actions">
                    <button onClick={() => generatePDF(h)}><FileText size={14} /></button>
                    {isAdmin && <button onClick={() => deleteHistory(h.id)}><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showInfoModal && (
        <div className="manager-overlay">
          <div className="manager-content" style={{maxWidth: '800px', width: '95%'}}>
            <div className="manager-header">
              <h3>{editingInfoId ? t.edit : (lang === 'hu' ? 'Új hirdetmény' : 'Neue Anzeige')}</h3>
              <button className="icon-btn" onClick={() => setShowInfoModal(false)}><X size={24} /></button>
            </div>
            <div className="product-form">
              <div className="input-group">
                <label>{lang === 'hu' ? 'Üzenet' : 'Nachricht'}</label>
                <div className="rich-text-toolbar">
                  <button type="button" onClick={() => document.execCommand('bold')} title="Bold">B</button>
                  <button type="button" onClick={() => document.execCommand('underline')} title="Underline">U</button>
                  <input 
                    type="color" 
                    onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                    title="Text Color"
                  />
                </div>
                <div 
                  className="rich-editor"
                  contentEditable
                  onBlur={(e) => setNewInfoEntry({...newInfoEntry, message: e.currentTarget.innerHTML})}
                  dangerouslySetInnerHTML={{ __html: newInfoEntry.message }}
                />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                <div className="log-input-group">
                  <label>{t.dept}</label>
                  <select 
                    className="log-input"
                    value={newInfoEntry.department}
                    onChange={(e) => setNewInfoEntry({...newInfoEntry, department: e.target.value})}
                  >
                    <option value="PRODUKTION">PRODUKTION</option>
                    <option value="INSTANDHALTUNG">INSTANDHALTUNG</option>
                    <option value="QUALITÄT">QUALITÄT</option>
                    <option value="LOGISTIK">LOGISTIK</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="log-input-group">
                  <label>{t.prio}</label>
                  <select 
                    className="log-input"
                    value={newInfoEntry.priority}
                    onChange={(e) => setNewInfoEntry({...newInfoEntry, priority: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Yellow)</option>
                    <option value="urgent">Urgent (Red)</option>
                  </select>
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                <div className="log-input-group">
                  <label>{lang === 'hu' ? 'Szerző' : 'Autor'}</label>
                  <input 
                    type="text" 
                    className="log-input"
                    value={newInfoEntry.author}
                    onChange={(e) => setNewInfoEntry({...newInfoEntry, author: e.target.value})}
                  />
                </div>
                <div className="log-input-group">
                  <label>{lang === 'hu' ? 'Lejárat (opcionális)' : 'Ablauf (optional)'}</label>
                  <input 
                    type="datetime-local" 
                    className="log-input"
                    value={newInfoEntry.expires_at}
                    onChange={(e) => setNewInfoEntry({...newInfoEntry, expires_at: e.target.value})}
                  />
                </div>
              </div>
              <button className="save-btn-premium" onClick={saveInfoEntry} style={{marginTop: '25px', width: '100%'}}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
