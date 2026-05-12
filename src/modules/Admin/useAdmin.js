import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

export const useAdmin = () => {
  const [products, setProducts] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSoll, setNewProductSoll] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [logbookConfig, setLogbookConfig] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchLogbookConfig();
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
    const { error } = await supabase
      .from('collini_logbook_config')
      .insert([{ type, value, label }]);
    if (!error) fetchLogbookConfig();
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
    editingId, setEditingId, logbookConfig,
    saveProduct, deleteProduct, saveConfigItem, deleteConfigItem, fetchProducts, fetchLogbookConfig
  };
};
