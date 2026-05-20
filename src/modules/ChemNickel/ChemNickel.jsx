import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronDown,
  ChevronRight,
  Droplets, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle, 
  FileText, 
  Check, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useChemNickel } from './useChemNickel';
import { format } from 'date-fns';
import LoadingOverlay from '../../components/LoadingOverlay';
import CustomDateTimePicker from '../../components/CustomDateTimePicker/CustomDateTimePicker';

const ChemNickel = () => {
  const { t, setView, selectedLine, staff, isLoading } = useApp();
  const chem = useChemNickel();
  const [now, setNow] = useState(new Date());

  // Manual Override States
  const [selectedOverridePos, setSelectedOverridePos] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('auto'); // 'auto', 'ansatz', 'wb', 'empty'
  const [overrideAnsatz, setOverrideAnsatz] = useState('');
  const [overrideWbTime, setOverrideWbTime] = useState(new Date().toISOString());
  const [writeToHistory, setWriteToHistory] = useState(true);
  const [showManualRecords, setShowManualRecords] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const getWbStatus = (wbTime) => {
    if (!wbTime) return { status: 'pending', progress: 0 };
    
    const wbDate = new Date(wbTime);
    const readyDate = new Date(wbDate.getTime() + 12 * 60 * 60 * 1000);
    const diffMs = readyDate.getTime() - now.getTime();
    const totalMs = 12 * 60 * 60 * 1000;
    
    if (diffMs <= 0) {
      return { status: 'ready', progress: 100 };
    } else {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const elapsedMs = totalMs - diffMs;
      const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
      return { 
        status: 'cleaning', 
        remainingStr: `${diffHours}h ${diffMinutes}m`,
        progress: progressPercent
      };
    }
  };

  const getRowWbStatus = (rec) => {
    if (!rec.wb_time) return { status: 'pending', progress: 0 };
    
    const wbDate = new Date(rec.wb_time);
    const totalDurationMs = 12 * 60 * 60 * 1000;
    
    // Find subsequent records affecting the same source bath
    const newerRecords = chem.records.filter(r => 
      r.id !== rec.id &&
      new Date(r.pump_time) > wbDate &&
      (r.source_position === rec.source_position || r.target_position === rec.source_position)
    );
    
    // Find the immediate next one
    newerRecords.sort((a, b) => new Date(a.pump_time) - new Date(b.pump_time));
    const nextActionRecord = newerRecords[0];
    
    if (nextActionRecord) {
      const nextDate = new Date(nextActionRecord.pump_time);
      const actualDurationMs = nextDate.getTime() - wbDate.getTime();
      const isEarly = actualDurationMs < totalDurationMs;
      const progressPercent = Math.min(100, Math.max(0, Math.round((actualDurationMs / totalDurationMs) * 100)));
      
      if (isEarly) {
        const diffMs = totalDurationMs - actualDurationMs;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
          status: 'early_completed',
          progress: progressPercent,
          remainingStr: `Vorzeitig: -${diffHours}h ${diffMinutes}m`
        };
      } else {
        return {
          status: 'completed',
          progress: 100,
          remainingStr: 'Abgeschlossen'
        };
      }
    } else {
      // Still active in the bath
      const readyDate = new Date(wbDate.getTime() + totalDurationMs);
      const diffMs = readyDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        return { status: 'ready', progress: 100, remainingStr: 'Bereit zum Spülen' };
      } else {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const elapsedMs = totalDurationMs - diffMs;
        const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
        return { 
          status: 'cleaning', 
          remainingStr: `${diffHours}h ${diffMinutes}m`,
          progress: progressPercent
        };
      }
    }
  };

  // Nickel bath positions
  const nickelPositions = [
    '37-38',
    '39-40',
    '42-43',
    '44-45'
  ];

  // Helper to format date safely
  const formatDateTime = (isoString) => {
    if (!isoString) return '---';
    try {
      return format(new Date(isoString), 'dd.MM.yyyy HH:mm');
    } catch (e) {
      return '---';
    }
  };

  // Helper to identify manual/initialization records
  const isManualRecord = (rec) => {
    return (
      rec.source_position?.toLowerCase() === 'initialisierung' || 
      rec.target_position?.toLowerCase() === 'initialisierung' ||
      rec.remark?.includes('Manuelle Zuweisung')
    );
  };

  const renderRow = (rec, isManual = false) => {
    const statusObj = rec.wb_time ? getRowWbStatus(rec) : null;
    const isCollapsed = isManual && !showManualRecords;
    return (
      <tr 
        key={rec.id} 
        className={`${rec.wb_time ? 'row-status-erledigt' : 'row-status-in_arbeit'} ${isCollapsed ? 'manual-row-collapsed' : ''}`}
        style={isManual ? { opacity: 0.85, background: 'rgba(255, 255, 255, 0.01)' } : undefined}
      >
        {/* Pumping Time */}
        <td className="col-date" style={{ fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
          {formatDateTime(rec.pump_time)}
        </td>
        
        {/* Ansatz */}
        <td style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
          {rec.ansatz}
        </td>
        
        {/* Route */}
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <span className="line-badge" style={{ margin: 0, background: 'rgba(255,255,255,0.05)', color: '#fff' }}>{rec.source_position}</span>
            <ArrowRight size={14} style={{ opacity: 0.5 }} />
            <span className="line-badge" style={{ margin: 0 }}>{rec.target_position}</span>
          </div>
        </td>
        
        {/* Operator */}
        <td style={{ fontWeight: 500 }}>
          {rec.operator}
        </td>
        
        {/* Wannenbeize (WB) Status / Time */}
        <td>
          {rec.wb_time ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'stretch', width: '100%' }}>
              {/* Progress Bar (Thicker and fills the field) */}
              <div style={{ 
                width: '100%', 
                height: '14px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '7px', 
                overflow: 'hidden',
                border: '1px solid rgba(255, 59, 48, 0.25)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                position: 'relative'
              }}>
                <div 
                  className={statusObj?.status === 'ready' ? 'progress-glow-pulse' : ''}
                  style={{ 
                    width: `${statusObj?.progress || 0}%`, 
                    height: '100%', 
                    background: statusObj?.status === 'ready' 
                      ? 'linear-gradient(90deg, #ff3b30, #ff453a)' 
                      : statusObj?.status === 'early_completed'
                        ? 'linear-gradient(90deg, #ff9500, #8e8e93)'
                        : statusObj?.status === 'completed'
                          ? 'linear-gradient(90deg, #ff3b30, rgba(255, 59, 48, 0.4))'
                          : 'linear-gradient(90deg, #ff9500, #ff3b30)', 
                    borderRadius: '6px',
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>

              {/* Info row under the progress bar */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                width: '100%', 
                fontSize: '0.72rem', 
                fontFamily: 'var(--font-mono)', 
                color: 'var(--text-secondary)',
                padding: '0 2px'
              }}>
                {/* Start (0% position) - Bepumpálás dátuma */}
                <div style={{ textAlign: 'left', flex: '1 1 0%', opacity: 0.85 }} title="Bepumpálás">
                  {format(new Date(rec.wb_time), 'dd.MM. HH:mm')}
                </div>
                
                {/* Center (Remaining time) */}
                <div style={{ 
                  textAlign: 'center', 
                  flex: '2 1 0%', 
                  fontWeight: statusObj?.status === 'ready' ? '800' : '600',
                  color: statusObj?.status === 'ready' 
                    ? '#ff3b30' 
                    : statusObj?.status === 'early_completed'
                      ? '#ff9500'
                      : statusObj?.status === 'completed'
                        ? 'rgba(255, 59, 48, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)'
                }}>
                  {statusObj?.status === 'ready' ? (
                    <span className="pulse-red-badge" style={{ padding: '2px 6px', background: 'rgba(255, 59, 48, 0.15)', border: '1px solid #ff3b30', borderRadius: '4px', display: 'inline-block' }}>
                      {t.wbReadyForRinse || 'Bereit zum Spülen'}
                    </span>
                  ) : (
                    <span>{statusObj?.remainingStr} ({statusObj?.progress}%)</span>
                  )}
                </div>

                {/* End (100% position) - Cél dátum */}
                <div style={{ textAlign: 'right', flex: '1 1 0%', opacity: 0.85 }} title="Fertig (12h)">
                  {format(new Date(new Date(rec.wb_time).getTime() + 12 * 60 * 60 * 1000), 'dd.MM. HH:mm')}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
              <div 
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '0.75rem', 
                  background: 'rgba(255, 59, 48, 0.05)', 
                  border: '1px solid rgba(255, 59, 48, 0.4)', 
                  color: 'rgba(255, 59, 48, 0.8)', 
                  borderRadius: '20px', 
                  marginBottom: '2px' 
                }}
              >
                {t.wbPending || 'WB ausstehend'}
              </div>
              <button 
                className="small-btn no-print" 
                onClick={(e) => {
                  e.stopPropagation();
                  chem.setWbTimeNow(rec.id, rec.source_position);
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  fontSize: '0.75rem', 
                  padding: '4px 8px',
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid #ff3b30',
                  color: '#ff3b30',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Clock size={12} /> {t.pumpAction || 'WB bepumpen'}
              </button>
            </div>
          )}
        </td>
        
        {/* Remark */}
        <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'left', paddingLeft: '15px' }}>
          {rec.remark || '---'}
        </td>
        
        {/* Actions (Edit / Delete) */}
        <td className="col-edit no-print">
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              className="edit-icon-btn" 
              onClick={(e) => { 
                e.stopPropagation(); 
                chem.openEditModal(rec); 
              }}
              title={t.edit}
            >
              <Edit3 size={14} />
            </button>
            <button 
              className="edit-icon-btn delete" 
              onClick={(e) => {
                e.stopPropagation();
                chem.deleteRecord(rec.id, rec.source_position, rec.target_position);
              }}
              title={t.delete}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Helper to determine the status/color of each of the 4 double baths
  const getBathVisualStatus = (position) => {
    // 1. Check for manual override first!
    const override = chem.overrides?.find(o => o.position === position);
    
    if (override && override.status !== 'auto') {
      if (override.status === 'ansatz') {
        return {
          status: 'ansatz',
          label: override.ansatz ? `Ansatz ${override.ansatz}` : 'Ansatz aktiv',
          color: '#34c759',
          bg: 'rgba(52, 199, 89, 0.1)',
          border: '#34c759',
          details: 'Manuelle Zuweisung',
          isOverridden: true,
          overrideVal: override
        };
      } else if (override.status === 'wb') {
        const wbStatus = getWbStatus(override.wb_start_time);
        
        let label = 'Wannenbeize (WB)';
        let details = `Manuelle Befüllung: ${formatDateTime(override.wb_start_time)}`;
        let color = '#ff3b30';
        let bg = 'rgba(255, 59, 48, 0.1)';
        let border = '#ff3b30';
        
        if (wbStatus.status === 'ready') {
          label = 'Spülen bereit (WB)';
          details = 'Manuelle Beizzeit beendet';
        } else if (wbStatus.status === 'cleaning') {
          label = `Beizzeit: ${wbStatus.remainingStr}`;
        }
        
        return {
          status: 'wb',
          label,
          color,
          bg,
          border,
          details,
          isOverridden: true,
          overrideVal: override
        };
      } else if (override.status === 'empty') {
        return {
          status: 'empty',
          label: 'Leer (Wartet auf WB)',
          color: '#ffcc00',
          bg: 'rgba(255, 204, 0, 0.1)',
          border: '#ffcc00',
          details: 'Manuelle Entleerung',
          isOverridden: true,
          overrideVal: override
        };
      }
    }

    // 2. Fallback to automatic history-based status:
    const sorted = [...chem.records].sort((a, b) => new Date(b.pump_time) - new Date(a.pump_time));
    const latestRecord = sorted.find(r => r.source_position === position || r.target_position === position);
    
    if (!latestRecord) {
      return { 
        status: 'ansatz', 
        label: 'Ansatz aktiv', 
        color: '#34c759', 
        bg: 'rgba(52, 199, 89, 0.1)', 
        border: '#34c759',
        details: 'Kein Verlauf erfasst',
        isOverridden: false
      };
    }
    
    if (latestRecord.target_position === position) {
      return { 
        status: 'ansatz', 
        label: `Ansatz ${latestRecord.ansatz}`, 
        color: '#34c759', 
        bg: 'rgba(52, 199, 89, 0.1)', 
        border: '#34c759',
        details: `Geladen: ${formatDateTime(latestRecord.pump_time)}`,
        isOverridden: false
      };
    } else {
      if (latestRecord.wb_time) {
        return { 
          status: 'wb', 
          label: 'Wannenbeize (WB)', 
          color: '#ff3b30', 
          bg: 'rgba(255, 59, 48, 0.1)', 
          border: '#ff3b30',
          details: `Bepumpt: ${formatDateTime(latestRecord.wb_time)}`,
          isOverridden: false
        };
      } else {
        return { 
          status: 'empty', 
          label: 'Leer (Wartet auf WB)', 
          color: '#ffcc00', 
          bg: 'rgba(255, 204, 0, 0.1)', 
          border: '#ffcc00',
          details: `Abgepumpt: ${formatDateTime(latestRecord.pump_time)}`,
          isOverridden: false
        };
      }
    }
  };

  // Calculate statistics
  const totalCount = chem.records.length;
  const completedCount = chem.records.filter(r => r.wb_time).length;

  const manualRecords = chem.records.filter(isManualRecord);
  const normalRecords = chem.records.filter(r => !isManualRecord(r));

  return (
    <div className="full-view-wrapper">
      <style>{`
        @keyframes pulse-red {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.5);
            transform: scale(1);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(255, 59, 48, 0);
            transform: scale(1.02);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
            transform: scale(1);
          }
        }
        .pulse-red-badge {
          animation: pulse-red 2s infinite ease-in-out;
        }
        @keyframes pulse-glow {
          0% {
            box-shadow: 0 0 2px rgba(255, 59, 48, 0.4);
            opacity: 0.8;
          }
          50% {
            box-shadow: 0 0 10px rgba(255, 59, 48, 0.9);
            opacity: 1;
          }
          100% {
            box-shadow: 0 0 2px rgba(255, 59, 48, 0.4);
            opacity: 0.8;
          }
        }
        .progress-glow-pulse {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        @media screen {
          .manual-row-collapsed {
            display: none !important;
          }
        }
      `}</style>
      {isLoading && <LoadingOverlay />}

      {/* Print Header */}
      <div className="print-only-header">
        <div className="print-header-top">
          <span className="print-app-name">Collini Industrial Suite</span>
          <span className="print-date">{format(new Date(), 'dd.MM.yyyy HH:mm')}</span>
        </div>
        <div className="print-module-title">
          <h1>{t.chemnickelTitle || 'CHEM-NICKEL UMPUMPEN'}</h1>
          {selectedLine && <span className="line-badge">{selectedLine}</span>}
        </div>
      </div>

      {/* Main Header */}
      <div className="wt-header no-print">
        <div className="header-left">
          <button onClick={() => setView('hub')} className="back-btn">
            <ChevronLeft size={20} /> {t.back}
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0, textTransform: 'uppercase' }}>
            {t.chemnickelTitle || 'CHEM-NICKEL UMPUMPEN'}
            {selectedLine && <span className="line-badge" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>{selectedLine}</span>}
          </h1>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button className="icon-btn-header" onClick={() => window.print()} title={t.print}>
              <FileText size={20} />
            </button>
            <button className="add-entry-btn-premium" onClick={chem.openAddModal}>
              <Plus size={18} /> {t.addPumping || 'Umpumpen erfassen'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container animate-fade-in no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', padding: '20px 40px 10px 40px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '15px', borderRadius: '12px' }}>
            <Droplets size={30} className="text-accent" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>GESAMT</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{totalCount}</div>
          </div>
        </div>


        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '4px solid #ff3b30' }}>
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', padding: '15px', borderRadius: '12px' }}>
            <Check size={30} style={{ color: '#ff3b30' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>WB BEPUMPT</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ff3b30' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Bath Visual Status Grid */}
      <div className="glass-panel no-print" style={{ margin: '10px 40px 10px 40px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--accent-color)' }} /> Badstatus (Chemisch Nickel Bad-Schema)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {nickelPositions.map(pos => {
            const statusInfo = getBathVisualStatus(pos);
            return (
              <div 
                key={`visual-${pos}`} 
                style={{ 
                  background: statusInfo.bg, 
                  border: `2px solid ${statusInfo.border}`, 
                  borderRadius: '12px', 
                  padding: '15px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '8px', 
                  transition: 'all 0.3s ease',
                  boxShadow: statusInfo.status === 'wb' ? '0 0 15px rgba(255, 59, 48, 0.15)' : 'none',
                  position: 'relative'
                }}
              >
                {/* Manual Override Control Header */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    fontSize: '0.6rem', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: statusInfo.isOverridden ? 'rgba(255, 204, 0, 0.15)' : 'rgba(0, 242, 254, 0.1)',
                    color: statusInfo.isOverridden ? '#ffcc00' : 'var(--accent-color)',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {statusInfo.isOverridden ? 'MANUELL' : 'AUTO'}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedOverridePos(pos);
                      setWriteToHistory(true);
                      if (statusInfo.isOverridden) {
                        setOverrideStatus(statusInfo.overrideVal.status);
                        setOverrideAnsatz(statusInfo.overrideVal.ansatz || '');
                        setOverrideWbTime(statusInfo.overrideVal.wb_start_time || new Date().toISOString());
                      } else {
                        setOverrideStatus('auto');
                        setOverrideAnsatz('');
                        setOverrideWbTime(new Date().toISOString());
                      }
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    title="Manuelle Steuerung"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  Bad {pos}
                </div>
                
                {/* Visual Tank representation */}
                <div style={{ 
                  width: '60px', 
                  height: '70px', 
                  border: `2px solid ${statusInfo.color}`, 
                  borderRadius: '6px', 
                  position: 'relative', 
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  {/* Liquid fill */}
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: statusInfo.status === 'empty' ? '15%' : '75%', 
                    background: statusInfo.color, 
                    opacity: 0.7, 
                    transition: 'all 0.5s ease',
                    borderRadius: '0 0 4px 4px'
                  }} />
                  {/* Content Label overlay inside the tank */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    color: '#fff',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    zIndex: 2,
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {statusInfo.status === 'ansatz' ? statusInfo.label.replace('Ansatz ', '') : (statusInfo.status === 'wb' ? 'WB' : 'LEER')}
                  </div>
                </div>

                {/* Status Badges */}
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: statusInfo.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {statusInfo.label}
                </span>

                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {statusInfo.details}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Override Edit Modal */}
      {selectedOverridePos && (
        <div className="manager-overlay">
          <div className="manager-content" style={{ maxWidth: '400px' }}>
            <div className="manager-header">
              <h3>Bad {selectedOverridePos} - Steuerung</h3>
              <button className="icon-btn" onClick={() => setSelectedOverridePos(null)}><X size={24} /></button>
            </div>
            
            <div className="product-form" style={{ padding: '15px 0' }}>
              <div className="input-group">
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Steuerungsmodus</label>
                <select 
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '6px', 
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginTop: '5px'
                  }}
                >
                  <option value="auto">Automatisch (Verlauf-basiert)</option>
                  <option value="ansatz">Manuell: Ansatz aktiv</option>
                  <option value="wb">Manuell: Wannenbeize (WB)</option>
                  <option value="empty">Manuell: Leer (Wartet auf WB)</option>
                </select>
              </div>

              {overrideStatus === 'ansatz' && (
                <div className="input-group" style={{ marginTop: '15px' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ansatz *</label>
                  <select 
                    value={overrideAnsatz}
                    onChange={(e) => setOverrideAnsatz(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      background: 'rgba(255,255,255,0.05)', 
                      color: '#fff', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginTop: '5px'
                    }}
                  >
                    <option value="">---</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="A3">A3</option>
                  </select>
                </div>
              )}

              {overrideStatus === 'wb' && (
                <div className="input-group" style={{ marginTop: '15px' }}>
                  <CustomDateTimePicker 
                    label="WB Befüllungszeitpunkt *"
                    value={overrideWbTime}
                    onChange={(val) => setOverrideWbTime(val)}
                  />
                </div>
              )}

              {overrideStatus !== 'auto' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '15px' }}>
                  <input 
                    type="checkbox" 
                    id="writeToHistoryCheck"
                    checked={writeToHistory}
                    onChange={(e) => setWriteToHistory(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                  />
                  <label htmlFor="writeToHistoryCheck" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
                    Als Protokolleintrag im Verlauf speichern (Automatische Weiterverfolgung)
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button 
                  className="cancel-btn" 
                  onClick={() => setSelectedOverridePos(null)}
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', 
                    background: 'transparent', 
                    color: '#fff', 
                    cursor: 'pointer' 
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  className="add-entry-btn-premium" 
                  onClick={async () => {
                    if (overrideStatus === 'ansatz' && !overrideAnsatz) {
                      alert('Bitte wählen Sie einen Ansatz aus!');
                      return;
                    }
                    await chem.saveOverride(selectedOverridePos, overrideStatus, overrideAnsatz, overrideStatus === 'wb' ? overrideWbTime : null, overrideStatus === 'auto' ? false : writeToHistory);
                    setSelectedOverridePos(null);
                  }}
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '6px', 
                    background: 'var(--accent-color)', 
                    color: '#000', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    cursor: 'pointer' 
                  }}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      <div className="logbook-main animate-fade-in" style={{ padding: '10px 40px 40px 40px' }}>
        <div className="logbook-table-container">
          <table className="logbook-table">
            <thead>
              <tr>
                <th className="col-date">{t.pumpTime || 'Umpumpzeit'}</th>
                <th style={{ width: '12%' }}>{t.ansatz || 'Ansatz'}</th>
                <th style={{ width: '20%' }}>{t.sourcePos || 'Quelle'} ➔ {t.targetPos || 'Ziel'}</th>
                <th style={{ width: '15%' }}>{t.operator || 'Bediener'}</th>
                <th style={{ width: '22%' }}>{t.wbTime || 'Wannenbeize (WB)'}</th>
                <th>{t.remark || 'Bemerkung'}</th>
                <th className="no-print" style={{ width: '100px' }}></th>
              </tr>
            </thead>
            <tbody>
              {normalRecords.map(rec => renderRow(rec, false))}

              {manualRecords.length > 0 && (
                <>
                  <tr 
                    onClick={() => setShowManualRecords(!showManualRecords)} 
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                    className="no-print"
                  >
                    <td colSpan="7" style={{ padding: '15px 20px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
                        {showManualRecords ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span>{t.manualAssignments || 'Manuelle Zuweisungen / Initialisierungen'} ({manualRecords.length})</span>
                      </div>
                    </td>
                  </tr>

                  {manualRecords.map(rec => renderRow(rec, true))}
                </>
              )}
              
              {totalCount === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                    <p>Keine Umpumpvorgänge für diesen Zeitraum erfasst.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {chem.showModal && (
        <div className="manager-overlay">
          <div className="manager-content">
            <div className="manager-header">
              <h3>{chem.editingId ? (t.editPumping || 'Umpumpen bearbeiten') : (t.addPumping || 'Umpumpen erfassen')}</h3>
              <button className="icon-btn" onClick={chem.closeModal}><X size={24} /></button>
            </div>
            
            <div className="product-form">
              {/* Pump Time */}
              <div className="input-group">
                <CustomDateTimePicker 
                  label={`${t.pumpTime || 'Umpumpzeit'} *`}
                  value={chem.formData.pump_time}
                  onChange={(val) => chem.setFormData({ ...chem.formData, pump_time: val })}
                />
              </div>

              {/* Ansatz */}
              <div className="input-group">
                <label>{t.ansatz || 'Ansatz'} *</label>
                <select 
                  value={chem.formData.ansatz} 
                  onChange={(e) => chem.setFormData({ ...chem.formData, ansatz: e.target.value })} 
                >
                  <option value="">---</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="A3">A3</option>
                </select>
              </div>

              {/* Source & Target Positions */}
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="input-group">
                  <label>{t.sourcePos || 'Quelle'} *</label>
                  <select 
                    value={chem.formData.source_position} 
                    onChange={(e) => chem.setFormData({ ...chem.formData, source_position: e.target.value })} 
                  >
                    <option value="">---</option>
                    {nickelPositions.map(pos => <option key={`src-${pos}`} value={pos}>{pos}</option>)}
                  </select>
                </div>

                <div className="input-group">
                  <label>{t.targetPos || 'Ziel'} *</label>
                  <select 
                    value={chem.formData.target_position} 
                    onChange={(e) => chem.setFormData({ ...chem.formData, target_position: e.target.value })} 
                  >
                    <option value="">---</option>
                    {nickelPositions.map(pos => <option key={`target-${pos}`} value={pos}>{pos}</option>)}
                  </select>
                </div>
              </div>

              {/* Operator */}
              <div className="input-group">
                <label>{t.operator || 'Bediener'} *</label>
                <select 
                  value={chem.formData.operator} 
                  onChange={(e) => chem.setFormData({ ...chem.formData, operator: e.target.value })}
                >
                  <option value="">---</option>
                  {staff && staff.filter(s => s.type === 'operator' || s.type === 'mech').map(o => (
                    <option key={o.id} value={o.value}>{o.label}</option>
                  ))}
                  {/* Fallback option if staff is empty */}
                  {(!staff || staff.length === 0) && (
                    <>
                      <option value="OP1">Operator 1</option>
                      <option value="OP2">Operator 2</option>
                    </>
                  )}
                </select>
              </div>

              {/* WB Time (Optional / Retroactive entry) */}
              <div className="input-group">
                <CustomDateTimePicker 
                  label={t.wbTime || 'Wannenbeize (WB) befüllt am'}
                  value={chem.formData.wb_time}
                  onChange={(val) => chem.setFormData({ ...chem.formData, wb_time: val })}
                />
              </div>

              {/* Remark */}
              <div className="input-group">
                <label>{t.remark || 'Bemerkung'}</label>
                <textarea 
                  rows="3"
                  placeholder={t.remark}
                  value={chem.formData.remark} 
                  onChange={(e) => chem.setFormData({ ...chem.formData, remark: e.target.value })}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                <button className="cancel-btn" onClick={chem.closeModal} style={{ flex: 1 }}>
                  {t.cancel || 'Abbrechen'}
                </button>
                <button className="add-btn" onClick={chem.saveRecord} style={{ flex: 2 }}>
                  {t.save || 'Speichern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChemNickel;
