import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';

export const useChemNickel = () => {
  const { selectedLine, setIsLoading, askConfirm } = useApp();
  const [records, setRecords] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    pump_time: new Date().toISOString(),
    ansatz: '',
    source_position: '',
    target_position: '',
    wb_time: null,
    operator: '',
    remark: ''
  });

  const resetForm = () => {
    setFormData({
      pump_time: new Date().toISOString(),
      ansatz: '',
      source_position: '',
      target_position: '',
      wb_time: null,
      operator: '',
      remark: ''
    });
    setEditingId(null);
  };

  useEffect(() => {
    if (selectedLine) {
      fetchRecords();
    }
  }, [selectedLine]);

  const fetchRecords = async () => {
    if (!selectedLine) return;
    setIsLoading(true);
    try {
      const [recordsRes, overridesRes] = await Promise.all([
        supabase
          .from('collini_chemnickel_pumpings')
          .select('*')
          .eq('machine_line', selectedLine)
          .order('pump_time', { ascending: false }),
        supabase
          .from('collini_chemnickel_overrides')
          .select('*')
          .eq('machine_line', selectedLine)
      ]);

      if (recordsRes.error) throw recordsRes.error;
      if (overridesRes.error) throw overridesRes.error;

      if (recordsRes.data) setRecords(recordsRes.data);
      if (overridesRes.data) setOverrides(overridesRes.data);
    } catch (err) {
      console.error('Error fetching pumping logs and overrides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOverride = async (position, status, ansatz = null, wb_start_time = null, writeToHistory = false) => {
    setIsLoading(true);
    try {
      if (writeToHistory) {
        // Create a log entry in collini_chemnickel_pumpings
        const payload = {
          machine_line: selectedLine || 'KS-24',
          pump_time: status === 'wb' ? (wb_start_time || new Date().toISOString()) : new Date().toISOString(),
          ansatz: status === 'ansatz' ? ansatz : '---',
          source_position: status === 'ansatz' ? 'Initialisierung' : position,
          target_position: status === 'ansatz' ? position : 'Initialisierung',
          wb_time: status === 'wb' ? (wb_start_time || new Date().toISOString()) : null,
          operator: 'System',
          remark: `Manuelle Zuweisung (${status === 'ansatz' ? `Ansatz ${ansatz}` : status === 'wb' ? 'WB' : 'Leer'})`
        };

        const { error } = await supabase
          .from('collini_chemnickel_pumpings')
          .insert([payload]);

        if (error) throw error;

        // Also delete any existing override for this position to keep it in AUTO mode!
        await supabase
          .from('collini_chemnickel_overrides')
          .delete()
          .eq('machine_line', selectedLine || 'KS-24')
          .eq('position', position);

      } else {
        if (status === 'auto') {
          const { error } = await supabase
            .from('collini_chemnickel_overrides')
            .delete()
            .eq('machine_line', selectedLine || 'KS-24')
            .eq('position', position);
          if (error) throw error;
        } else {
          const payload = {
            machine_line: selectedLine || 'KS-24',
            position,
            status,
            ansatz: status === 'ansatz' ? ansatz : null,
            wb_start_time: status === 'wb' ? (wb_start_time || new Date().toISOString()) : null,
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('collini_chemnickel_overrides')
            .upsert(payload, { onConflict: 'machine_line,position' });

          if (error) throw error;
        }
      }
      await fetchRecords();
    } catch (err) {
      console.error('Error saving override:', err);
      alert('Fehler beim Speichern der manuellen Zuweisung!');
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecord = async () => {
    if (!formData.pump_time || !formData.ansatz || !formData.source_position || !formData.target_position || !formData.operator) {
      alert('Bitte füllen Sie alle Pflichtfelder aus!');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        machine_line: selectedLine || 'KS-24',
        pump_time: formData.pump_time,
        ansatz: formData.ansatz,
        source_position: formData.source_position,
        target_position: formData.target_position,
        wb_time: formData.wb_time || null,
        operator: formData.operator,
        remark: formData.remark
      };

      if (editingId) {
        const { error } = await supabase
          .from('collini_chemnickel_pumpings')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collini_chemnickel_pumpings')
          .insert([payload]);
        if (error) throw error;
      }

      // Delete overrides for source and target positions to return them to auto mode
      await supabase
        .from('collini_chemnickel_overrides')
        .delete()
        .eq('machine_line', selectedLine || 'KS-24')
        .in('position', [formData.source_position, formData.target_position]);

      setShowModal(false);
      resetForm();
      await fetchRecords();
    } catch (err) {
      console.error('Error saving pumping log:', err);
      alert('Fehler beim Speichern!');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id, sourcePos = null, targetPos = null) => {
    askConfirm('Möchten Sie diesen Umpumpvorgang wirklich löschen?', async () => {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('collini_chemnickel_pumpings')
          .delete()
          .eq('id', id);
        
        if (error) throw error;

        // Clear overrides for these positions as deleting historical logs changes the auto baseline
        const positions = [];
        if (sourcePos) positions.push(sourcePos);
        if (targetPos) positions.push(targetPos);
        if (positions.length > 0) {
          await supabase
            .from('collini_chemnickel_overrides')
            .delete()
            .eq('machine_line', selectedLine || 'KS-24')
            .in('position', positions);
        }

        await fetchRecords();
      } catch (err) {
        console.error('Error deleting record:', err);
        alert('Fehler beim Löschen!');
      } finally {
        setIsLoading(false);
      }
    });
  };

  const setWbTimeNow = async (id, position = null) => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('collini_chemnickel_pumpings')
        .update({ wb_time: now })
        .eq('id', id);
      
      if (error) throw error;

      if (position) {
        await supabase
          .from('collini_chemnickel_overrides')
          .delete()
          .eq('machine_line', selectedLine || 'KS-24')
          .eq('position', position);
      }

      await fetchRecords();
    } catch (err) {
      console.error('Error updating WB time:', err);
      alert('Fehler beim Aktualisieren der WB-Zeit!');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingId(record.id);
    setFormData({
      pump_time: record.pump_time,
      ansatz: record.ansatz,
      source_position: record.source_position,
      target_position: record.target_position,
      wb_time: record.wb_time || null,
      operator: record.operator,
      remark: record.remark || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return {
    records,
    overrides,
    showModal,
    editingId,
    formData,
    setFormData,
    openAddModal,
    openEditModal,
    closeModal,
    saveRecord,
    deleteRecord,
    setWbTimeNow,
    saveOverride
  };
};
