import React from 'react';
import { X, Trash2, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAdmin } from './useAdmin';

const AdminManager = () => {
  const { t, lang, setShowManager } = useApp();
  const admin = useAdmin();

  return (
    <div className="manager-overlay">
      <div className="manager-content wide-manager">
        <div className="manager-header">
          <h2>{t.adminDashboard}</h2>
          <button className="icon-btn" onClick={() => setShowManager(false)}><X size={24} /></button>
        </div>
        <div className="admin-grid">
          <div className="admin-card">
            <h3>{t.manageProducts}</h3>
            <div className="product-form">
              <input type="text" placeholder={t.productName} value={admin.newProductName} onChange={(e) => admin.setNewProductName(e.target.value)} />
              <input type="number" placeholder={t.targetThickness} value={admin.newProductSoll} onChange={(e) => admin.setNewProductSoll(e.target.value)} />
              <button className="add-btn" onClick={admin.saveProduct}>
                {admin.editingId ? t.updateProduct : t.saveProduct}
              </button>
            </div>
            <div className="product-list">
              {admin.products.map((p) => (
                <div key={p.id} className="product-item">
                  <span>{p.name} ({p.target_thickness} µm)</span>
                  <div className="product-actions">
                    <button className="edit-btn" onClick={() => {
                      admin.setEditingId(p.id); 
                      admin.setNewProductName(p.name); 
                      admin.setNewProductSoll(p.target_thickness.toString());
                    }}>
                      <Edit2 size={14} />
                    </button>
                    <button className="delete-btn" onClick={() => admin.deleteProduct(p.id)}><Trash2 size={14} /></button>
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
                  {admin.logbookConfig.filter(c => c.type === 'dept').map(item => (
                    <div key={item.id} className="config-item">
                      <span>{item.label} ({item.value})</span>
                      <button onClick={() => admin.deleteConfigItem(item.id)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4>{t.mechs}</h4>
                <div className="config-list">
                  {admin.logbookConfig.filter(c => c.type === 'mech').map(item => (
                    <div key={item.id} className="config-item">
                      <span>{item.label}</span>
                      <button onClick={() => admin.deleteConfigItem(item.id)}><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManager;
