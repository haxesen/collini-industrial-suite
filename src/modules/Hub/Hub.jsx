import React from 'react';
import { 
  Calculator, Book, Megaphone, ClipboardCheck, 
  BarChart3, Hammer, Lock, Unlock, Factory, Maximize, Minimize 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import LanguageToggle from '../../components/LanguageToggle';
import colliniLogo from '../../assets/Collini_Logo.svg';

const Hub = () => {
  const { t, setView, isAdmin, setIsAdmin, setShowAdminLogin, setSelectedLine } = useApp();
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const modules = [
    { id: 'calculator', icon: Calculator, title: t.calculator, desc: t.calcDesc, disabled: false },
    { id: 'logbook', icon: Book, title: t.logbook, desc: t.logbookDesc, disabled: false },
    { id: 'checklist', icon: ClipboardCheck, title: t.checklist, desc: t.checklistDesc, disabled: true },
    { id: 'info_wall', icon: Megaphone, title: t.infoWall, desc: t.infoWallDesc, disabled: false },
    { id: 'prodPlan', icon: BarChart3, title: t.prodPlan, desc: t.prodPlanDesc, disabled: true },
    { id: 'wartungsplaner', icon: Hammer, title: t.wartungsplaner, desc: t.wartungsplanerDesc, disabled: true },
  ];

  return (
    <div className="hub-container">
      <header className="hub-header">
        <div className="hub-title">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={colliniLogo} alt="Collini" className="hub-logo" />
            {selectedLine && <span className="line-badge">{selectedLine}</span>}
          </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="hub-header-btn"
                onClick={toggleFullscreen}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', color: '#fff' }}
                title="Vollbild"
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
              
              <button 
                className="hub-header-btn"
                onClick={() => {
                  localStorage.removeItem('collini_selected_line');
                  setSelectedLine(null); // Reset internally to keep Fullscreen
                }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', color: '#fff' }}
                title="Linie wechseln"
              >
                <Factory size={24} />
              </button>
              <button 
                className={`hub-header-btn ${isAdmin ? 'admin-active' : ''}`} 
                onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', color: '#fff' }}
              >
                {isAdmin ? <Unlock size={24} /> : <Lock size={24} />}
              </button>
            </div>
          </div>
          <h1 style={{ marginBottom: '5px' }}>{t.hubTitle}</h1>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.7rem', 
            opacity: 0.5, 
            marginTop: '-5px', 
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {t.createdBy}
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>{t.hubSub}</p>
        </div>
      </header>
      
      <div className="hub-grid">
        {modules.map((m) => (
          <div 
            key={m.id} 
            className={`hub-card ${m.disabled ? 'disabled' : ''}`} 
            onClick={() => !m.disabled && setView(m.id)}
          >
            {m.disabled && <div className="coming-soon-badge">{t.comingSoon}</div>}
            <div className="hub-card-icon"><m.icon size={60} /></div>
            <h2>{m.title}</h2>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>

      <LanguageToggle style={{ marginTop: '40px' }} />
      
    </div>
  );
};

export default Hub;
