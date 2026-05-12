import React from 'react';
import { 
  ChevronLeft, History, Lock, Unlock, 
  RotateCcw, Save, FileText, Trash2, X,
  Plus, Edit3, Monitor
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useInfoWall } from './useInfoWall';
import { formatDate, getDeptDisplay } from '../../utils/helpers';
import LanguageToggle from '../../components/LanguageToggle';
import colliniLogo from '../../assets/Collini_Logo.svg';



const InfoWall = () => {
  const { t, setView, isAdmin, setIsAdmin, setShowAdminLogin, lang, selectedLine } = useApp();
  const info = useInfoWall();
  const editorRef = React.useRef(null);

  // Sync editor content only when it's different from state (e.g. on load/edit)
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== info.newInfoEntry.message) {
      editorRef.current.innerHTML = info.newInfoEntry.message;
    }
  }, [info.newInfoEntry.message]);

  return (
    <div className="app-container">
      <header>
        <div className="header-top">
          <button className="back-btn" onClick={() => setView('hub')}>
            <ChevronLeft size={20} /> {t.back}
          </button>
          <LanguageToggle className="lang-toggle-header" />
          <div className="header-actions">
            <button 
              className="icon-btn-header" 
              onClick={() => {
                const url = new URL(window.location.origin + window.location.pathname + '#public');
                if (selectedLine) url.hash += `?line=${selectedLine}`;
                window.open(url.href, '_blank');
              }}
              title={lang === 'hu' ? 'Kivetítés másik monitorra' : 'Auf anderem Monitor anzeigen'}
            >
              <Monitor size={20} />
            </button>
            <button className="add-entry-btn-premium" onClick={() => {
              info.setEditingInfoId(null); 
              info.setNewInfoEntry({message: '', department: 'PRODUKTION', priority: '2_normal', author: ''}); 
              info.setShowInfoModal(true);
            }}>
              <Plus size={20} /> {lang === 'hu' ? 'ÚJ HÍRDETÉS' : 'NEUE INFO'}
            </button>
            <button 
              className={`icon-btn-header ${isAdmin ? 'admin-active' : ''}`} 
              onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
            >
              {isAdmin ? <Unlock size={20} /> : <Lock size={20} />}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
          <img src={colliniLogo} alt="Collini Logo" className="header-logo" style={{ marginBottom: 0 }} />
          {selectedLine && <span className="line-badge" style={{ marginLeft: '15px' }}>{selectedLine}</span>}
        </div>
        <div className="subtitle">{t.infoWall}</div>
      </header>

      <main>
        <div className="info-wall-grid">
          {info.activeInfos.length === 0 ? (
            <div className="empty-msg" style={{gridColumn: '1/-1'}}>{t.noActiveAds}</div>
          ) : (
            info.activeInfos.map(item => (
              <div key={item.id} className={`info-card priority-${item.priority.split('_')[1] || item.priority}`}>
                <div className="info-card-header">
                  <span className="info-dept">{item.author}</span>
                  <span className="info-date">{formatDate(item.created_at, lang)}</span>
                </div>
                <div className="info-card-body">
                   <div dangerouslySetInnerHTML={{ __html: item.message }} />
                </div>
                <div className="info-card-footer">
                   <span className="info-author">{getDeptDisplay(item.department)}</span>
                    <div className="info-card-actions">
                      <button className="info-action-btn" onClick={() => info.startEditInfo(item)}><Edit3 size={16} /></button>
                      {isAdmin && (
                        <button className="info-action-btn delete" onClick={() => info.deleteInfoEntry(item.id)}><Trash2 size={16} /></button>
                      )}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {info.showInfoModal && (
        <div className="manager-overlay">
          <div className="manager-content" style={{maxWidth: '800px', width: '95%'}}>
            <div className="manager-header">
              <h3>{info.editingInfoId ? t.edit : t.newAd}</h3>
              <button className="icon-btn" onClick={() => info.setShowInfoModal(false)}><X size={24} /></button>
            </div>
            <div className="product-form">
              <div className="input-group">
                <label>{t.adMessage}</label>
                <div className="rich-text-toolbar">
                  <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('bold')} title="Bold">B</button>
                  <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('italic')} title="Italic">I</button>
                  <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('underline')} title="Underline">U</button>
                  <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => document.execCommand('insertUnorderedList')} title="List">•</button>
                  <div className="color-picker-wrapper" onMouseDown={(e) => e.preventDefault()}>
                    <input 
                      type="color" 
                      className="toolbar-color-input"
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
                  ref={editorRef}
                  className="rich-editor"
                  contentEditable
                  onInput={(e) => info.setNewInfoEntry({...info.newInfoEntry, message: e.currentTarget.innerHTML})}
                />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px'}}>
                <div className="input-group">
                  <label>{t.dept}</label>
                  <select 
                    value={info.newInfoEntry.department} 
                    onChange={(e) => info.setNewInfoEntry({...info.newInfoEntry, department: e.target.value})}
                  >
                    {info.logbookConfig.filter(c => c.type === 'dept').map(d => (
                      <option key={d.id} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="log-input-group">
                  <label>{t.prio}</label>
                  <select 
                    className="log-input"
                    value={info.newInfoEntry.priority}
                    onChange={(e) => info.setNewInfoEntry({...info.newInfoEntry, priority: e.target.value})}
                  >
                    <option value="2_normal" style={{color: '#3b82f6'}}>{lang === 'hu' ? 'Normál (Kék)' : 'Normal (Blau)'}</option>
                    <option value="1_high" style={{color: '#ffcc00'}}>{lang === 'hu' ? 'Fontos (Sárga)' : 'Wichtig (Gelb)'}</option>
                    <option value="0_urgent" style={{color: '#ff3b30'}}>{lang === 'hu' ? 'Sürgős (Piros)' : 'Dringend (Rot)'}</option>
                  </select>
                </div>
              </div>
              <div style={{marginTop: '15px'}}>
                <div className="input-group">
                <label>{lang === 'hu' ? 'Szerző' : 'Autor'}</label>
                <select 
                  className="log-input"
                  value={info.newInfoEntry.author} 
                  onChange={(e) => info.setNewInfoEntry({...info.newInfoEntry, author: e.target.value})}
                >
                  <option value="">---</option>
                  {info.staff?.map(p => (
                    <option key={p.id} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="save-btn-premium" onClick={info.saveInfoEntry} style={{marginTop: '25px', width: '100%'}}>
              {t.save}
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default InfoWall;
