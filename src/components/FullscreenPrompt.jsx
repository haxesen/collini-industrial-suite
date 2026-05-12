import React from 'react';
import { Maximize2 } from 'lucide-react';

const FullscreenPrompt = ({ onEnter }) => {
  return (
    <div className="fullscreen-prompt-overlay">
      <div className="prompt-card">
        <div className="prompt-icon-wrapper">
          <Maximize2 size={40} />
        </div>
        <h2>Immersives Erlebnis</h2>
        <p>
          Willkommen in der Collini Industrial Suite. Für eine optimale Darstellung und Bedienung empfehlen wir den Vollbildmodus.
        </p>
        <button className="prompt-btn" onClick={onEnter}>
          Vollbild Starten
        </button>
      </div>
    </div>
  );
};

export default FullscreenPrompt;
