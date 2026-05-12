import React, { useState } from 'react';
import { 
  ChevronLeft, History, Lock, Unlock, 
  RotateCcw, Save, FileText, Trash2, X,
  Settings, Search, Plus, Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLogbook } from './useLogbook';
import { formatDate, getPrioLabel } from '../../utils/helpers';
import LanguageToggle from '../../components/LanguageToggle';
import colliniLogo from '../../assets/Collini_Logo.svg';

const Logbook = () => {
  const { t, setView, isAdmin, setIsAdmin, setShowAdminLogin, setShowManager, lang, selectedLine } = useApp();
  const log = useLogbook();
  const [finisherName, setFinisherName] = useState('');
  const [finisherMassnahme, setFinisherMassnahme] = useState('');

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <button className="back-btn" onClick={() => setView('hub')}>
            <ChevronLeft size={20} /> {t.back}
          </button>
          <LanguageToggle className="lang-toggle-header" />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '10px' }}>
          <img src={colliniLogo} alt="Collini Logo" className="header-logo" style={{ marginBottom: 0, marginLeft: 0 }} />
          {selectedLine && <span className="line-badge">{selectedLine}</span>}
        </div>
        <div className="subtitle">{t.logbook}</div>
      </header>

      <main className="logbook-main">
        <div className="logbook-header">
          <div className="logbook-controls">
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder={t.search} value={log.logSearch} onChange={(e) => log.setLogSearch(e.target.value)} />
            </div>
            <select className="filter-select" value={log.logFilterStatus} onChange={(e) => log.setLogFilterStatus(e.target.value)}>
              <option value="All">{t.allStatus}</option>
              <option value="1_Offen">{t.open}</option>
              <option value="2_In_Arbeit">{t.inProgress}</option>
              <option value="3_Erledigt">{t.done}</option>
            </select>
            <select className="filter-select" value={log.logFilterPrio} onChange={(e) => log.setLogFilterPrio(e.target.value)}>
              <option value="All">{t.allPrio}</option>
              <option value="0_kritisch">{t.kritisch}</option>
              <option value="1_hoch">{t.hoch}</option>
              <option value="2_mittel">{t.mittel}</option>
              <option value="4_info">{lang === 'hu' ? 'INFÓ' : 'INFO'}</option>
            </select>
            <select className="filter-select" value={log.logFilterDept} onChange={(e) => log.setLogFilterDept(e.target.value)}>
              <option value="All">{t.allDept}</option>
              {log.logbookConfig.filter(c => c.type === 'dept').map(d => (
                <option key={d.id} value={d.value}>{d.label}</option>
              ))}
            </select>
            <button className="reset-filters-btn" onClick={log.resetFilters}><RotateCcw size={16} /></button>
          </div>
          <button className="add-entry-btn-premium" onClick={() => { log.setShowLogEntryModal(true); }}>
            <Plus size={18} /> {t.addEntry}
          </button>
        </div>

        <div className="logbook-table-container">
          <table className="logbook-table">
            <thead>
              <tr>
                <th onClick={() => log.handleSort('created_at')} className="sortable">{t.printDate} {log.logSortConfig.key === 'created_at' && (log.logSortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                <th style={{ width: '40px' }}>{t.isNew}</th>
                <th>{t.problem}</th>
                <th>{t.erfasser}</th>
                <th onClick={() => log.handleSort('prio')} className="sortable">{t.prio}</th>
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
              {log.filteredAndSortedEntries.map(entry => (
                <tr key={entry.id} className={`row-prio-${entry.prio.split('_')[1] || entry.prio} row-status-${entry.status.split('_').slice(1).join('_').toLowerCase()}`}>
                  <td className="col-date">{formatDate(entry.created_at, t.lang)}</td>
                  <td className="col-new">
                    {entry.is_new && <span className="new-dot"></span>}
                  </td>
                  <td className="col-problem">
                    <div className="problem-text" dangerouslySetInnerHTML={{ __html: entry.problem_info }} />
                  </td>
                  <td className="col-erfasser">{entry.erfasser}</td>
                  <td className="col-prio">
                    <span className={`prio-badge ${entry.prio.split('_')[1] || entry.prio}`}>
                      {getPrioLabel(entry.prio, t)}
                    </span>
                  </td>
                  <td className="col-dept">{entry.abteilung}</td>
                  <td className="col-who">
                    <span className="worker-name">{entry.wer_ist_dran || '---'}</span>
                  </td>
                  <td className="col-action">
                    {entry.massnahme || '---'}
                  </td>
                  <td className="col-start-time">
                    {entry.status === '1_Offen' ? (
                      <button className="small-btn start-btn" onClick={() => log.quickUpdateLog(entry.id, 'in_arbeit_ab', new Date().toISOString())}>{t.start}</button>
                    ) : (
                      formatDate(entry.in_arbeit_ab, t.lang)
                    )}
                  </td>
                  <td className="col-end-time">
                    {entry.status === '2_In_Arbeit' ? (
                      <button className="small-btn done" onClick={() => log.quickUpdateLog(entry.id, 'erledigt_am', new Date().toISOString())}>{t.done}</button>
                    ) : (
                      formatDate(entry.erledigt_am, t.lang)
                    )}
                  </td>
                  <td className="col-status">
                    <div className={`status-badge-container ${entry.status.split('_').slice(1).join('_').toLowerCase()}`}>
                      {entry.status === '1_Offen' ? t.open : entry.status === '2_In_Arbeit' ? t.inProgress : t.done}
                    </div>
                  </td>
                  <td className="col-completed-by">{entry.erledigt_von || '---'}</td>
                  <td className="col-edit">
                    <button className="edit-icon-btn" onClick={() => log.startEditLog(entry)}><Edit3 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {log.showLogEntryModal && (
        <div className="manager-overlay">
          <div className="manager-content">
            <div className="manager-header">
              <h3>{log.editingLogId ? t.edit : t.newEntry}</h3>
              <button className="icon-btn" onClick={() => log.setShowLogEntryModal(false)}><X size={24} /></button>
            </div>
            <div className="product-form">
              <div className="input-group">
                <label>{t.problem}</label>
                <div className="rich-text-toolbar">
                  <button type="button" className="btn-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} title="Bold">B</button>
                  <button type="button" className="btn-italic" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} title="Italic">I</button>
                  <button type="button" className="btn-underline" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} title="Underline">U</button>
                  <div className="color-picker-wrapper" onMouseDown={(e) => e.preventDefault()}>
                    <input 
                      type="color" 
                      onChange={(e) => document.execCommand('foreColor', false, e.target.value)} 
                      title="Text Color"
                    />
                    <div className="color-btn-display">
                      <span>A</span>
                      <div className="color-stripe"></div>
                    </div>
                  </div>
                </div>
                <div 
                  className="rich-editor"
                  contentEditable
                  onBlur={(e) => log.setNewLogEntry({...log.newLogEntry, problem_info: e.currentTarget.innerHTML})}
                  dangerouslySetInnerHTML={{ __html: log.newLogEntry.problem_info }}
                  style={{ minHeight: '150px' }}
                />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>{t.erfasser}</label>
                  <input type="text" value={log.newLogEntry.erfasser} onChange={(e) => log.setNewLogEntry({...log.newLogEntry, erfasser: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>{t.dept}</label>
                  <select value={log.newLogEntry.abteilung} onChange={(e) => log.setNewLogEntry({...log.newLogEntry, abteilung: e.target.value})}>
                    {log.logbookConfig.filter(c => c.type === 'dept').map(d => (
                      <option key={d.id} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>{t.prio}</label>
                  <select value={log.newLogEntry.prio} onChange={(e) => log.setNewLogEntry({...log.newLogEntry, prio: e.target.value})}>
                    <option value="0_kritisch">{t.kritisch}</option>
                    <option value="1_hoch">{t.hoch}</option>
                    <option value="2_mittel">{t.mittel}</option>
                    <option value="4_info">{lang === 'hu' ? 'INFÓ' : 'INFO'}</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>{t.who}</label>
                  <select 
                    value={log.newLogEntry.wer_ist_dran} 
                    onChange={(e) => log.setNewLogEntry({...log.newLogEntry, wer_ist_dran: e.target.value})}
                  >
                    <option value="">---</option>
                    {log.logbookConfig
                      .filter(c => {
                        if (log.newLogEntry.abteilung === 'PR') return c.type === 'operator';
                        if (log.newLogEntry.abteilung === 'WU') return c.type === 'mech';
                        return c.type === 'operator' || c.type === 'mech';
                      })
                      .map(p => (
                        <option key={p.id} value={p.value}>{p.label}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>{t.action}</label>
                <div className="rich-text-toolbar">
                  <button type="button" className="btn-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} title="Bold">B</button>
                  <button type="button" className="btn-italic" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} title="Italic">I</button>
                  <button type="button" className="btn-underline" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} title="Underline">U</button>
                  <div className="color-picker-wrapper" onMouseDown={(e) => e.preventDefault()}>
                    <input 
                      type="color" 
                      onChange={(e) => document.execCommand('foreColor', false, e.target.value)} 
                      title="Text Color"
                    />
                    <div className="color-btn-display">
                      <span>A</span>
                      <div className="color-stripe"></div>
                    </div>
                  </div>
                </div>
                <div 
                  className="rich-editor"
                  contentEditable
                  onBlur={(e) => log.setNewLogEntry({...log.newLogEntry, massnahme: e.currentTarget.innerHTML})}
                  dangerouslySetInnerHTML={{ __html: log.newLogEntry.massnahme }}
                  style={{ minHeight: '100px' }}
                />
              </div>
              <button className="add-btn" onClick={log.saveLogEntry}>{t.save}</button>
            </div>
          </div>
        </div>
      )}

      {log.showFinishModal && (
        <div className="manager-overlay">
          <div className="manager-content">
            <div className="manager-header">
              <h3>{t.completedBy}</h3>
              <button className="icon-btn" onClick={() => { log.setShowFinishModal(false); setFinisherMassnahme(''); }}><X size={24} /></button>
            </div>
            <div className="product-form">
              <div className="input-group">
                <label>{t.completedBy}</label>
                <select value={finisherName} onChange={(e) => setFinisherName(e.target.value)}>
                  <option value="">---</option>
                  {log.logbookConfig.filter(c => c.type === 'mech' || c.type === 'op').map(d => (
                    <option key={d.id} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>{t.action}</label>
                <div className="rich-text-toolbar">
                  <button type="button" className="btn-bold" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} title="Bold">B</button>
                  <button type="button" className="btn-italic" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} title="Italic">I</button>
                  <button type="button" className="btn-underline" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} title="Underline">U</button>
                  <input 
                    type="color" 
                    onMouseDown={(e) => e.preventDefault()}
                    onChange={(e) => document.execCommand('foreColor', false, e.target.value)} 
                    title="Text Color"
                  />
                </div>
                <div 
                  className="rich-editor"
                  contentEditable
                  onBlur={(e) => setFinisherMassnahme(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={{ __html: finisherMassnahme }}
                  style={{ minHeight: '120px' }}
                />
              </div>
              <button className="add-btn" onClick={() => { 
                log.finalizeRepair(finisherName, finisherMassnahme); 
                setFinisherName(''); 
                setFinisherMassnahme('');
              }}>{t.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logbook;
