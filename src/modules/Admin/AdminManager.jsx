import React from 'react';
import { X, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAdmin } from './useAdmin';

const AdminManager = () => {
  const { t, lang, setShowManager, askConfirm } = useApp();
  const admin = useAdmin();

  return (
    <div className="manager-overlay">
      <div className="manager-content wide-manager">
        <div className="manager-header">
          <h2>{t.adminDashboard}</h2>
          <button className="icon-btn" onClick={() => setShowManager(false)}><X size={24} /></button>
        </div>
        <div className="admin-grid">
          {/* Products Management */}
          <div className="admin-card">
            <h3>{t.manageProducts}</h3>
            <div className="admin-form-group">
              <input type="text" placeholder={t.productName} value={admin.newProductName} onChange={(e) => admin.setNewProductName(e.target.value)} />
              <input type="number" placeholder={t.targetThickness} value={admin.newProductSoll} onChange={(e) => admin.setNewProductSoll(e.target.value)} />
              <button className="admin-add-btn" onClick={admin.saveProduct}>
                {admin.editingId ? t.updateProduct : t.saveProduct}
              </button>
            </div>
            <div className="admin-data-list">
              {admin.products.map((p) => (
                <div key={p.id} className="admin-data-item">
                  <span>{p.name} ({p.target_thickness} µm)</span>
                  <div className="admin-data-actions">
                    <button className="edit-btn" onClick={() => {
                      admin.setEditingId(p.id); 
                      admin.setNewProductName(p.name); 
                      admin.setNewProductSoll(p.target_thickness.toString());
                    }}><Edit2 size={14} /></button>
                    <button className="delete-btn" onClick={() => {
                      askConfirm(
                        lang === 'hu' ? `Biztosan törlöd a(z) "${p.name}" terméket?` : `Produkt "${p.name}" wirklich löschen?`,
                        () => admin.deleteProduct(p.id)
                      );
                    }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staff & Depts Management */}
          <div className="admin-card">
            <h3>{t.logbook} {t.settings}</h3>
            
            {/* Departments */}
            <div className="admin-sub-section">
              <h4>{t.depts}</h4>
              <div className="admin-inline-form">
                <input type="text" placeholder="Label (pl. KS-24)" value={admin.newConfigLabel} onChange={e => admin.setNewConfigLabel(e.target.value)} />
                <input type="text" placeholder="Value (pl. ks24)" value={admin.newConfigValue} onChange={e => admin.setNewConfigValue(e.target.value)} />
                <button onClick={() => { admin.saveConfigItem('dept', admin.newConfigValue, admin.newConfigLabel); admin.setNewConfigLabel(''); admin.setNewConfigValue(''); }}>Hozzáadás</button>
              </div>
              <div className="admin-data-list compact">
                {admin.logbookConfig.filter(c => c.type === 'dept').map(item => (
                  <div key={item.id} className="admin-data-item">
                    <span>{item.label} <small>({item.value})</small></span>
                    <button className="delete-btn" onClick={() => {
                      askConfirm(
                        lang === 'hu' ? `Biztosan törlöd a(z) "${item.label}" kategóriát?` : `Kategorie "${item.label}" wirklich löschen?`,
                        () => admin.deleteConfigItem(item.id)
                      );
                    }}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Operators - Anlagenführer */}
            <div className="admin-sub-section" style={{ marginTop: '20px' }}>
              <h4>{t.ops}</h4>
              <div className="admin-inline-form">
                <input type="text" placeholder="Név" value={admin.newConfigLabel} onChange={e => admin.setNewConfigLabel(e.target.value)} />
                <button onClick={() => { admin.saveConfigItem('operator', admin.newConfigLabel, admin.newConfigLabel); admin.setNewConfigLabel(''); }}>Hozzáadás</button>
              </div>
              <div className="admin-data-list compact">
                {admin.logbookConfig.filter(c => c.type === 'operator').map(item => (
                  <div key={item.id} className="admin-data-item">
                    <span>{item.label}</span>
                    <button className="delete-btn" onClick={() => {
                      askConfirm(
                        lang === 'hu' ? `Biztosan törlöd a(z) "${item.label}" kezelőt?` : `Bediener "${item.label}" wirklich löschen?`,
                        () => admin.deleteConfigItem(item.id)
                      );
                    }}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mechs - Karbantartók */}
            <div className="admin-sub-section" style={{ marginTop: '20px' }}>
              <h4>{t.mechs}</h4>
              <div className="admin-inline-form">
                <input type="text" placeholder="Név" value={admin.newConfigLabel} onChange={e => admin.setNewConfigLabel(e.target.value)} />
                <button onClick={() => { admin.saveConfigItem('mech', admin.newConfigLabel, admin.newConfigLabel); admin.setNewConfigLabel(''); }}>Hozzáadás</button>
              </div>
              <div className="admin-data-list compact">
                {admin.logbookConfig.filter(c => c.type === 'mech').map(item => (
                  <div key={item.id} className="admin-data-item">
                    <span>{item.label}</span>
                    <button className="delete-btn" onClick={() => {
                      askConfirm(
                        lang === 'hu' ? `Biztosan törlöd a(z) "${item.label}" karbantartót?` : `Instandhalter "${item.label}" wirklich löschen?`,
                        () => admin.deleteConfigItem(item.id)
                      );
                    }}><Trash2 size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManager;
