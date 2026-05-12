import React from 'react';
import { useApp } from '../context/AppContext';

const LanguageToggle = ({ style }) => {
  const { lang, setLang } = useApp();

  return (
    <div className="lang-toggle" style={style}>
      <button className={lang === 'hu' ? 'active' : ''} onClick={() => setLang('hu')}>HU</button>
      <button className={lang === 'de' ? 'active' : ''} onClick={() => setLang('de')}>DE</button>
    </div>
  );
};

export default LanguageToggle;
