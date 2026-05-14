import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';

export const useLogbook = () => {
  const { selectedLine, setIsLoading, isLoading } = useApp();
  const [logEntries, setLogEntries] = useState([]);
  const [logbookConfig, setLogbookConfig] = useState([]);
  const [showLogEntryModal, setShowLogEntryModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishingEntryId, setFinishingEntryId] = useState(null);
  const [logSearch, setLogSearch] = useState('');
  const [logFilterStatus, setLogFilterStatus] = useState('All');
  const [logFilterPrio, setLogFilterPrio] = useState('All');
  const [logFilterDept, setLogFilterDept] = useState('All');
  const [logSortConfig, setLogSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [editingLogId, setEditingLogId] = useState(null);
  const [newLogEntry, setNewLogEntry] = useState({
    problem_info: '',
    erfasser: '',
    prio: '4_info',
    abteilung: 'PR',
    massnahme: '',
    status: '1_Offen',
    wer_ist_dran: '',
    is_new: true
  });

  const resetForm = () => {
    setNewLogEntry({
      problem_info: '',
      erfasser: '',
      prio: '4_info',
      abteilung: 'PR',
      massnahme: '',
      status: '1_Offen',
      wer_ist_dran: '',
      is_new: true
    });
    setEditingLogId(null);
  };

  useEffect(() => {
    if (selectedLine) {
      fetchLogbook();
      fetchLogbookConfig();
    }
  }, [selectedLine]);

  const fetchLogbook = async () => {
    if (!selectedLine) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('logbook')
        .select('*')
        .eq('machine_line', selectedLine)
        .order('created_at', { ascending: false });
      if (data) setLogEntries(data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogbookConfig = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('collini_logbook_config')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setLogbookConfig(data);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLogEntry = async () => {
    if (!newLogEntry.problem_info || !newLogEntry.erfasser || !selectedLine) return;
    
    setIsLoading(true);
    
    try {
      if (editingLogId) {
        const { error } = await supabase
          .from('logbook')
          .update({
            problem_info: newLogEntry.problem_info,
            erfasser: newLogEntry.erfasser,
            prio: newLogEntry.prio,
            abteilung: newLogEntry.abteilung,
            massnahme: newLogEntry.massnahme,
            wer_ist_dran: newLogEntry.wer_ist_dran
          })
          .eq('id', editingLogId);
        if (!error) {
          setShowLogEntryModal(false); resetForm(); fetchLogbook();
        }
      } else {
        const { error } = await supabase.from('logbook').insert([{
          ...newLogEntry,
          machine_line: selectedLine
        }]);
        if (!error) {
          setShowLogEntryModal(false); resetForm(); fetchLogbook();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLogEntry = async (id) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('logbook')
        .delete()
        .eq('id', id);
      if (!error) fetchLogbook();
    } finally {
      setIsLoading(false);
    }
  };

  const startEditLog = (entry) => {
    setEditingLogId(entry.id);
    setNewLogEntry({
      problem_info: entry.problem_info,
      erfasser: entry.erfasser,
      prio: entry.prio,
      abteilung: entry.abteilung,
      massnahme: entry.massnahme,
      wer_ist_dran: entry.wer_ist_dran,
      status: entry.status,
      is_new: entry.is_new
    });
    setShowLogEntryModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowLogEntryModal(true);
  };

  const closeEntryModal = () => {
    setShowLogEntryModal(false);
    resetForm();
  };

  const quickUpdateLog = async (id, field, value) => {
    const updateData = { [field]: value };
    if (field === 'in_arbeit_ab') {
      updateData.status = '2_In_Arbeit';
      updateData.is_new = false;
    }
    if (field === 'erledigt_am') {
      setFinishingEntryId(id); setShowFinishModal(true); return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('logbook').update(updateData).eq('id', id);
      if (!error) fetchLogbook();
    } finally {
      setIsLoading(false);
    }
  };

  const finalizeRepair = async (name, massnahme) => {
    if (!finishingEntryId || !name) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('logbook')
        .update({
          erledigt_am: now.toISOString(),
          erledigt_von: name,
          massnahme: massnahme,
          status: '3_Erledigt',
          is_new: false
        })
        .eq('id', finishingEntryId);
      
      if (!error) {
        setShowFinishModal(false); setFinishingEntryId(null); fetchLogbook();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (logSortConfig.key === key && logSortConfig.direction === 'asc') direction = 'desc';
    setLogSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setLogSearch(''); setLogFilterStatus('All'); setLogFilterPrio('All'); setLogFilterDept('All');
  };

  const filteredAndSortedEntries = logEntries
    .filter(entry => {
      const matchesSearch = entry.problem_info.toLowerCase().includes(logSearch.toLowerCase()) || 
                           entry.erfasser.toLowerCase().includes(logSearch.toLowerCase());
      const matchesStatus = logFilterStatus === 'All' || entry.status === logFilterStatus;
      const matchesPrio = logFilterPrio === 'All' || entry.prio === logFilterPrio;
      const matchesDept = logFilterDept === 'All' || entry.abteilung === logFilterDept;
      return matchesSearch && matchesStatus && matchesPrio && matchesDept;
    })
    .sort((a, b) => {
      let aVal = a[logSortConfig.key] || '';
      let bVal = b[logSortConfig.key] || '';
      if (logSortConfig.key === 'created_at') {
        aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime();
      }
      if (aVal < bVal) return logSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return logSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
  const activeEntries = filteredAndSortedEntries.filter(e => e.status !== '3_Erledigt');
  const completedEntries = filteredAndSortedEntries.filter(e => e.status === '3_Erledigt');
  
  return {
    logEntries, logbookConfig, showLogEntryModal, setShowLogEntryModal,
    showFinishModal, setShowFinishModal, finishingEntryId,
    logSearch, setLogSearch, logFilterStatus, setLogFilterStatus,
    logFilterPrio, setLogFilterPrio, logFilterDept, setLogFilterDept,
    logSortConfig, setLogSortConfig, editingLogId, newLogEntry, setNewLogEntry,
    saveLogEntry, startEditLog, openAddModal, closeEntryModal, quickUpdateLog, finalizeRepair, deleteLogEntry,
    handleSort, resetFilters, filteredAndSortedEntries, fetchLogbook,
    activeEntries, completedEntries, isLoading
  };
};
