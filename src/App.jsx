import React, { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { supabase } from './supabase'
import { useApp } from './context/AppContext'

// Layout Components
import GlobalTicker from './components/GlobalTicker'
import AdminLogin from './components/AdminLogin'
import ConfirmModal from './components/ConfirmModal'

// Modules
import Hub from './modules/Hub/Hub'
import Calculator from './modules/Calculator/Calculator'
import Logbook from './modules/Logbook/Logbook'
import InfoWall from './modules/InfoWall/InfoWall'
import PublicInfoWall from './modules/InfoWall/PublicInfoWall'
import AdminManager from './modules/Admin/AdminManager'
import MachineSelector from './modules/MainHub/MachineSelector'
import WTAblauf from './modules/WTAblauf/WTAblauf'
import ChemNickel from './modules/ChemNickel/ChemNickel'
import LoadingOverlay from './components/LoadingOverlay'
import './index.css'

function App() {
  const { 
    view, setView,
    showAdminLogin, 
    showManager, 
    isAdmin,
    activeInfos,
    selectedLine,
    isLoading,
    isOffline,
    t
  } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  };

  // Handle hash-based routing for public display
  useEffect(() => {
    if (window.location.hash.startsWith('#public')) {
      setView('public_infowall');
    }
  }, []);

  // Global layout class management
  useEffect(() => {
    if (view === 'public_infowall') {
      document.body.classList.add('public-view');
      return;
    }
    if (view === 'hub' || view === 'logbook' || view === 'info_wall' || view === 'calculator' || view === 'wtAblauf' || view === 'chemNickel') {
      document.body.classList.add('wide-layout')
    } else {
      document.body.classList.remove('wide-layout')
    }
  }, [view])

  // Loading state handling: If initial loading and no line selected, show full screen loader
  // Otherwise, show as overlay above the content
  const showFullLoader = isLoading && !selectedLine && view !== 'public_infowall';
  
  if (showFullLoader) {
    return <LoadingOverlay />;
  }

  const renderView = () => {
    switch(view) {
      case 'public_infowall':
        return <PublicInfoWall />;
      case 'hub':
        return <Hub />;
      case 'calculator':
        return <Calculator />;
      case 'logbook':
        return <Logbook />;
      case 'info_wall':
        return <InfoWall />;
      case 'wtAblauf':
        return <WTAblauf />;
      case 'chemNickel':
        return <ChemNickel />;
      default:
        return <Hub />;
    }
  };

  if (view === 'public_infowall') {
    return (
      <div className="public-view-wrapper">
        {renderView()}
      </div>
    );
  }

  if (!selectedLine && view !== 'public_infowall') {
    return <MachineSelector />;
  }

  return (
    <div className="full-view-wrapper">
      <GlobalTicker activeInfos={activeInfos} />
      
      <main className={`app-container ${['hub', 'logbook', 'info_wall', 'calculator', 'wtAblauf', 'chemNickel'].includes(view) ? 'wide-container' : ''}`}>
        {renderView()}
      </main>

      {showAdminLogin && <AdminLogin />}
      {showManager && isAdmin && <AdminManager />}
      <ConfirmModal />
      
      {isLoading && <LoadingOverlay />}

      {isOffline && (
        <div className="offline-banner">
          <WifiOff className="offline-icon" size={24} />
          <div className="offline-text">
            <strong>{t.offlineTitle}</strong>
            <span>{t.offlineMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
