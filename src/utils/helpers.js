export const formatDate = (dateStr) => {
  if (!dateStr) return '---'
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

export const getDeptDisplay = (dept) => {
  if (!dept) return '---';
  const mapping = {
    'TERMELÉS': 'PRODUKTION',
    'KARBANTARTÁS': 'INSTANDHALTUNG',
    'MINŐSÉG': 'QUALITÄT',
    'LOGISZTIKA': 'LOGISTIK',
    'PRODUCTION': 'PRODUKTION',
    'MAINTENANCE': 'INSTANDHALTUNG',
    'PRODUKTION': 'PRODUKTION',
    'INSTANDHALTUNG': 'INSTANDHALTUNG',
    'QUALITÄT': 'QUALITÄT',
    'LOGISTIK': 'LOGISTIK'
  };
  return mapping[dept.toUpperCase()] || dept;
};

export const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export const formatTime = (seconds) => {
  if (seconds <= 0) return { val: '0', unit: 'min' };
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);

  if (h > 0) return { val: `${h}:${m.toString().padStart(2, '0')}`, unit: 'h:m' };
  if (m > 0) return { val: m.toString(), unit: 'min' };
  return { val: s.toString(), unit: 'sek' };
};

export const getStatusColor = (remainingSeconds) => {
  if (remainingSeconds <= 0) return 'expired';
  if (remainingSeconds < 300) return 'critical';
  if (remainingSeconds < 900) return 'warning';
  return 'good';
};

export const getPrioLabel = (prio, t) => {
  if (prio === '1_hoch') return t.hoch.toUpperCase()
  if (prio === '2_mittel') return t.mittel.toUpperCase()
  return 'INFO'
};
