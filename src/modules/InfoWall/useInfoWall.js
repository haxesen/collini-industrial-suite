import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';

export const useInfoWall = () => {
  const { activeInfos, fetchActiveInfos, lang, staff, fetchStaff, selectedLine, setIsLoading } = useApp();
  const [logbookConfig, setLogbookConfig] = useState([]);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editingInfoId, setEditingInfoId] = useState(null);
  const [newInfoEntry, setNewInfoEntry] = useState({
    message: '',
    department: 'PRODUKTION',
    priority: '2_normal',
    author: ''
  });

  const fetchLogbookConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('collini_logbook_config')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) {
        setLogbookConfig(data);
        if (!newInfoEntry.department && data.length > 0) {
          const firstDept = data.find(c => c.type === 'dept');
          if (firstDept) setNewInfoEntry(prev => ({ ...prev, department: firstDept.value }));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbookConfig();
    fetchStaff();
  }, []);

  const saveInfoEntry = async () => {
    const finalAuthor = newInfoEntry.author || 'Horvat Tamas';
    if (!newInfoEntry.message || newInfoEntry.message === '<br>') {
      alert('Bitte geben Sie eine Nachricht ein!');
      return;
    }
    
    setIsLoading(true);
    const payload = { ...newInfoEntry, author: finalAuthor };

    try {
      if (editingInfoId) {
        const { error } = await supabase
          .from('collini_info_wall')
          .update(payload)
          .eq('id', editingInfoId);
        if (!error) {
          setEditingInfoId(null); setShowInfoModal(false); fetchActiveInfos();
        }
      } else {
        const { error } = await supabase
          .from('collini_info_wall')
          .insert([{ ...payload, machine_line: selectedLine }]);
        if (error) {
          console.error('Supabase Error:', error);
          alert('Database Error: ' + error.message);
        } else {
          setShowInfoModal(false); fetchActiveInfos();
        }
      }
    } finally {
      setIsLoading(false);
    }
    setNewInfoEntry({ message: '', department: 'PRODUKTION', priority: '2_normal', author: '' });
  };

  const deleteInfoEntry = async (id) => {
    const { error } = await supabase.from('collini_info_wall').delete().eq('id', id);
    if (!error) fetchActiveInfos();
  };

  const startEditInfo = (info) => {
    setEditingInfoId(info.id);
    setNewInfoEntry({
      message: info.message,
      department: info.department,
      priority: info.priority,
      author: info.author
    });
    setShowInfoModal(true);
  };

  return {
    activeInfos, 
    logbookConfig, 
    staff,
    showInfoModal, 
    setShowInfoModal,
    editingInfoId, 
    setEditingInfoId, 
    newInfoEntry, 
    setNewInfoEntry,
    saveInfoEntry, 
    deleteInfoEntry, 
    startEditInfo, 
    fetchActiveInfos
  };
};
