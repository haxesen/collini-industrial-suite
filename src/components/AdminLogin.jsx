import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AdminLogin = () => {
  const { t, setShowAdminLogin, setIsAdmin } = useApp();
  const [adminPassInput, setAdminPassInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const handleAdminLogin = () => {
    if (adminPassInput === 'Admin') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  return (
    <div className="manager-overlay">
      <div className="manager-content login-content">
        <div className="manager-header">
          <h3>{t.adminLogin}</h3>
          <button className="icon-btn" onClick={() => setShowAdminLogin(false)}><X size={24} /></button>
        </div>
        <div className="product-form">
          <div className="input-group">
            <label>{t.password || 'Passwort'}</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={adminPassInput} 
                onChange={(e) => setAdminPassInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                autoFocus
              />
            </div>
          </div>
          {loginError && <div className="error-msg" style={{color: 'var(--accent-red)', marginBottom: '15px', fontSize: '0.9rem', fontWeight: 'bold'}}>{t.invalidPass || 'Hibás jelszó'}</div>}
          <button className="add-entry-btn-premium" style={{width: '100%', justifyContent: 'center'}} onClick={handleAdminLogin}>
            <Lock size={18} />
            {t.login || 'LOGIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
