import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDeptDisplay } from '../../utils/helpers';
import { Maximize, Minimize } from 'lucide-react';

const PublicInfoWall = () => {
  const { activeInfos, lang } = useApp();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <div className="public-infowall-dashboard">
      <div className="dashboard-header">
        <h1>COLLINI INFOWALL</h1>
        <button className="fullscreen-toggle" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        <div className="dashboard-time">
          {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="dashboard-grid">
        {activeInfos.length === 0 ? (
          <div className="no-infos-large">
            Keine aktiven Nachrichten
          </div>
        ) : (
          activeInfos.map((info) => {
            const priorityLabel = info.priority?.includes('_') 
              ? info.priority.split('_')[1] 
              : info.priority || 'normal';
            
            const isUnacknowledged = (info.acknowledgments || []).length === 0;
            
            return (
              <div key={info.id} className={`dashboard-card priority-${priorityLabel} ${isUnacknowledged ? 'ticker-new-blink' : ''}`}>
                <div className="db-card-header">
                  <span className="db-dept">{getDeptDisplay(info.department)}</span>
                  <span className="db-priority">{priorityLabel.toUpperCase()}</span>
                </div>
                <div className="db-card-content" dangerouslySetInnerHTML={{ __html: info.message }} />
                <div className="db-card-footer">
                  <span className="db-author">{info.author || '---'}</span>
                  <span className="db-date">{new Date(info.created_at).toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="dashboard-footer">
        <div className="scrolling-notice">
          Echtzeit-Informationssystem | Collini Industrial Suite
        </div>
      </div>
    </div>
  );
};

export default PublicInfoWall;
