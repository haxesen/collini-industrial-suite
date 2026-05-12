import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

export const useCalculator = (t) => {
  const { selectedLine, setIsLoading } = useApp();
  const [currentTime, setCurrentTime] = useState('120');
  const [currentThickness, setCurrentThickness] = useState('17.86');
  const [targetThickness, setTargetThickness] = useState('23');
  const [batchNumber, setBatchNumber] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const [outputUnit, setOutputUnit] = useState('min');
  const [products, setProducts] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [history, setHistory] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (selectedLine) {
      fetchProducts();
      fetchHistory();
    }
  }, [selectedLine]);

  useEffect(() => {
    const t1 = parseFloat(currentTime);
    const d1 = parseFloat(currentThickness);
    const dTarget = parseFloat(targetThickness);

    if (t1 > 0 && d1 > 0 && dTarget > 0) {
      const totalTime = (t1 * dTarget) / d1;
      const rest = Math.max(0, totalTime - t1);
      setRemainingTime(rest);
    } else {
      setRemainingTime(0);
    }
  }, [currentTime, currentThickness, targetThickness]);

  const fetchProducts = async () => {
    if (!selectedLine) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('collini_products')
        .select('*')
        .eq('machine_line', selectedLine)
        .order('name', { ascending: true });
      if (data) setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!selectedLine) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('collini_history')
        .select('*')
        .eq('machine_line', selectedLine)
        .order('created_at', { ascending: false })
        .limit(50);
      if (data) setHistory(data);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCalculation = async () => {
    if (!remainingTime || !selectedLine) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.from('collini_history').insert([{
        batch_number: batchNumber,
        product_name: selectedProductName || t.manualEntry,
        calculation_result: remainingTime,
        machine_line: selectedLine
      }]);
      if (!error) {
        setIsSaved(true);
        fetchHistory();
        setTimeout(() => setIsSaved(false), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistory = async (id) => {
    setIsLoading(true);
    try {
      await supabase.from('collini_history').delete().eq('id', id);
      fetchHistory();
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = (item) => {
    const doc = new jsPDF();
    doc.setFillColor(10, 12, 16); doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text('COLLINI', 105, 20, { align: 'center' });
    doc.setFontSize(10); doc.text(t.printTitle, 105, 30, { align: 'center' });
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    
    const tableData = [
      [t.batch, item.batch_number || '---'],
      [t.productName, item.product_name],
      [t.remainingTime, `${Math.round(item.calculation_result)} min`],
      [t.printDate, formatDate(item.created_at, t.lang)]
    ];
    
    autoTable(doc, {
      startY: 50,
      head: [[t.batch, 'Data']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 255] }
    });
    doc.save(`Collini_${item.batch_number || 'export'}.pdf`);
  };

  const reset = () => {
    setCurrentTime('');
    setCurrentThickness('');
    setTargetThickness('');
    setBatchNumber('');
    setRemainingTime(0);
    setSelectedProductName('');
  };

  const formatResult = (minutes) => {
    if (outputUnit === 'sec') {
      return { val: Math.round(minutes * 60), unit: t.unitSec };
    }
    if (outputUnit === 'hm') {
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      return { val: `${h}:${m.toString().padStart(2, '0')}`, unit: t.unitHourMin };
    }
    return { val: Math.round(minutes), unit: t.unitMin };
  };

  const getStatusColorClass = (minutes) => {
    if (minutes <= 0) return 'gray';
    if (minutes <= 15) return 'status-green';
    if (minutes <= 45) return 'status-yellow';
    return 'status-blue';
  };

  return {
    currentTime, setCurrentTime,
    currentThickness, setCurrentThickness,
    targetThickness, setTargetThickness,
    batchNumber, setBatchNumber,
    remainingTime, outputUnit, setOutputUnit,
    products, selectedProductName, setSelectedProductName,
    history, isSaved, showHistory, setShowHistory,
    saveCalculation, deleteHistory, generatePDF, reset,
    formatResult, getStatusColorClass
  };
};
