import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export const useAdmin = () => {
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSoll, setNewProductSoll] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [logbookConfig, setLogbookConfig] = useState([]);
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [editingConfigType, setEditingConfigType] = useState(null);

  // Form States
  const [newDeptLabel, setNewDeptLabel] = useState('');
  const [newDeptValue, setNewDeptValue] = useState('');
  const [newOpName, setNewOpName] = useState('');
  const [newMechName, setNewMechName] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchLogbookConfig()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('collini_products')
      .select('*')
      .order('name', { ascending: true });
    if (data) setProducts(data);
  };

  const fetchLogbookConfig = async () => {
    const { data } = await supabase
      .from('collini_logbook_config')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) setLogbookConfig(data);
  };

  const saveProduct = async () => {
    if (!newProductName || !newProductSoll) return;
    if (editingId) {
      await supabase.from('collini_products').update({ name: newProductName, target_thickness: parseFloat(newProductSoll) }).eq('id', editingId);
      setEditingId(null);
    } else {
      await supabase.from('collini_products').insert([{ name: newProductName, target_thickness: parseFloat(newProductSoll) }]);
    }
    setNewProductName('');
    setNewProductSoll('');
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await supabase.from('collini_products').delete().eq('id', id);
    fetchProducts();
  };

  const saveConfigItem = async (type, value, label = null) => {
    if (!value) return;
    if (editingConfigId) {
      const { error } = await supabase
        .from('collini_logbook_config')
        .update({ type, value, label })
        .eq('id', editingConfigId);
      if (!error) {
        setEditingConfigId(null);
        setEditingConfigType(null);
        fetchLogbookConfig();
      }
    } else {
      const { error } = await supabase
        .from('collini_logbook_config')
        .insert([{ type, value, label }]);
      if (!error) fetchLogbookConfig();
    }
    setNewDeptLabel('');
    setNewDeptValue('');
    setNewOpName('');
    setNewMechName('');
    setEditingConfigType(null);
  };

  const deleteConfigItem = async (id) => {
    const { error } = await supabase
      .from('collini_logbook_config')
      .delete()
      .eq('id', id);
    if (!error) fetchLogbookConfig();
  };

  return {
    products, newProductName, setNewProductName, newProductSoll, setNewProductSoll,
    editingId, setEditingId, logbookConfig, isLoading,
    editingConfigId, setEditingConfigId,
    editingConfigType, setEditingConfigType,
    newDeptLabel, setNewDeptLabel, newDeptValue, setNewDeptValue,
    newOpName, setNewOpName, newMechName, setNewMechName,
    saveProduct, deleteProduct, saveConfigItem, deleteConfigItem, fetchProducts, fetchLogbookConfig
  };
};
