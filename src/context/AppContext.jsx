import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('collini_lang') || 'de');
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
    return localStorage.getItem('collini_selected_line');
  });
  const [machines, setMachines] = useState([]);
  const [activeInfos, setActiveInfos] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMachines = async () => {
    const { supabase } = await import('../supabase');
    const { data } = await supabase
      .from('collini_machines')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true });
    if (data) setMachines(data);
  };

  const fetchActiveInfos = async () => {
    // Determine which line to use (state or URL)
    let lineToFetch = selectedLine;
    if (!lineToFetch) {
       const hash = window.location.hash;
       if (hash.includes('line=')) lineToFetch = hash.split('line=')[1];
    }

    if (!lineToFetch) {
      setActiveInfos([]);
      return;
    }
    const { supabase } = await import('../supabase');
    const { data } = await supabase
      .from('collini_info_wall')
      .select('*')
      .eq('machine_line', lineToFetch)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (data) setActiveInfos(data);
  };

  const fetchStaff = async () => {
    const { supabase } = await import('../supabase');
    const { data } = await supabase
      .from('collini_logbook_config')
      .select('*')
      .filter('type', 'in', '("mech","operator")')
      .order('label', { ascending: true });
    if (data) setStaff(data);
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchMachines(), fetchStaff()]);
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

  const t = translations[lang];

  return (
    <AppContext.Provider value={{ 
      lang, setLang, 
      isAdmin, setIsAdmin, 
      view, setView, 
      t,
      showAdminLogin, setShowAdminLogin,
      showManager, setShowManager,
      activeInfos, fetchActiveInfos,
      staff, fetchStaff,
      selectedLine, setSelectedLine,
      machines, fetchMachines,
      isLoading, setIsLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
