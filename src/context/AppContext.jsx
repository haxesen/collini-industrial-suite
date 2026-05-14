import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang] = useState('de');
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState('hub');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [selectedLine, setSelectedLine] = useState(() => {
    // Check URL parameters first (useful for public displays)
    const hash = window.location.hash;
    if (hash.includes('line=')) {
      const line = hash.split('line=')[1];
      if (line) return line;
    }
    // Always start with Machine Selector by default on fresh load
    return null;
  });
  const [machines, setMachines] = useState([]);
  const [activeInfos, setActiveInfos] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
  const [moduleOrder, setModuleOrder] = useState(['wtAblauf', 'calculator', 'logbook', 'checklist', 'info_wall', 'prodPlan', 'wartungsplaner']);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchMachines = async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import('../supabase');
      const { data } = await supabase
        .from('collini_machines')
        .select('*')
        .order('name', { ascending: true });
      if (data) setMachines(data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActiveInfos = async () => {
    let lineToFetch = selectedLine;
    if (!lineToFetch) {
       const hash = window.location.hash;
       if (hash.includes('line=')) lineToFetch = hash.split('line=')[1];
    }

    if (!lineToFetch) {
      setActiveInfos([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { supabase } = await import('../supabase');
      const { data } = await supabase
        .from('collini_info_wall')
        .select('*')
        .eq('machine_line', lineToFetch)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (data) setActiveInfos(data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const { supabase } = await import('../supabase');
      const { data } = await supabase
        .from('collini_logbook_config')
        .select('*')
        .filter('type', 'in', '("mech","operator")')
        .order('label', { ascending: true });
      if (data) setStaff(data);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchModuleOrder = async () => {
    try {
      const { supabase } = await import('../supabase');
      const { data } = await supabase
        .from('collini_logbook_config')
        .select('*')
        .eq('type', 'hub_order')
        .maybeSingle();
      
      if (data && data.value) {
        setModuleOrder(data.value.split(','));
      }
    } catch (err) {
      console.error('Error fetching module order:', err);
    }
  };

  const updateModuleOrder = async (newOrder) => {
    setModuleOrder(newOrder);
    try {
      const { supabase } = await import('../supabase');
      const { data: existing } = await supabase
        .from('collini_logbook_config')
        .select('id')
        .eq('type', 'hub_order')
        .maybeSingle();
      
      if (existing) {
        await supabase
          .from('collini_logbook_config')
          .update({ value: newOrder.join(',') })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('collini_logbook_config')
          .insert({ type: 'hub_order', value: newOrder.join(','), label: 'Hub Module Order' });
      }
    } catch (err) {
      console.error('Error updating module order:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMachines(), fetchStaff(), fetchModuleOrder()]);
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedLine) {
      fetchActiveInfos();
      localStorage.setItem('collini_selected_line', selectedLine);
    }
  }, [selectedLine]);

  useEffect(() => {
    let channel;

    const setupSubscription = async () => {
      if (!selectedLine) return;
      const { supabase: sb } = await import('../supabase');
      
      channel = sb
        .channel('global_ticker_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'collini_info_wall',
          filter: `machine_line=eq.${selectedLine}`
        }, () => {
          fetchActiveInfos();
        })
        .subscribe();
    };
    
    setupSubscription();

    return () => {
      if (channel) {
        import('../supabase').then(m => m.supabase.removeChannel(channel));
      }
    };
  }, [selectedLine]);

  const t = translations['de'];

  const askConfirm = (message, onConfirm) => {
    setConfirmModal({ show: true, message, onConfirm });
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppContext.Provider value={{ 
      lang,
      isAdmin, setIsAdmin, 
      view, setView, 
      t,
      showAdminLogin, setShowAdminLogin,
      showManager, setShowManager,
      activeInfos, fetchActiveInfos,
      staff, fetchStaff,
      selectedLine, setSelectedLine,
      machines, fetchMachines,
      isLoading, setIsLoading,
      isOffline,
      confirmModal, setConfirmModal, askConfirm,
      moduleOrder, updateModuleOrder,
      isMobile
    }}>

      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
