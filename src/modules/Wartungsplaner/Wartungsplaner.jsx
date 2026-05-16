import React, { useState, useMemo, useEffect } from 'react';
import { Hammer, Users, Clock, CheckCircle2, Circle, PlayCircle, ChevronLeft, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Wartungsplaner = () => {
  const { 
    t, setView, selectedLine,
    maintenanceTasks: tasks, setMaintenanceTasks: setTasks,
    maintenanceStaffCount: staffCount, setMaintenanceStaffCount: setStaffCount,
    saveMaintenanceLog
  } = useApp();

  const [showHistory, setShowHistory] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bathLayout = {
    top: [
      '2432', '2431', '2430', '2429', 'GAP', '2427', '2426', '2425', '2424', '2423', '2422', '2421', '2420', '2419', '2418', 'GAP', '2417', '2415-2416', '2414', '2413', '2412', '2410-2411', '2408-2409', '2407-2406', '2405', '2404', '2403', '2402', '2401', '2400'
    ],
    mid: [
      '2433', '2434', '2435', '2436', 'GAP', '2437-2438', 'GAP', '2439-2440', '2441', 'GAP', '2442-2443', 'GAP', '2444-2445', '2446', '2447', '2448', '2449', '2450', '2451', '2452', '2453', 'GAP', '2454', '2455', '2456', '2457', '2458', '2459', '2460', '2461'
    ],
    bottom: [
      '2482', '2481', '2480', '2479', '2478', '2477', '2476', '2475', '2474', '2473', '2472', '2471', '2470', '2469', '2468',
      'GAP',
      '2467', '2466', '2465', '2464', '2463'
    ]
  };

  const updateTaskAction = (id, newAction) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, action: newAction } : t));
  };

  const getBathStatus = (id) => {
    if (id.includes('-')) {
      const parts = id.split('-');
      const statuses = parts.map(p => {
        const task = tasks.find(t => t.id === p);
        return task ? task.status : 'inactive';
      });
      if (statuses.includes('in-progress')) return 'in-progress';
      if (statuses.includes('pending')) return 'pending';
      if (statuses.includes('done')) return 'done';
      return 'inactive';
    }
    const task = tasks.find(t => t.id === id);
    return task ? task.status : 'inactive';
  };

  const toggleTaskStatus = (id) => {
    const idsToToggle = id.includes('-') ? id.split('-') : [id];
    setTasks(prev => prev.map(task => {
      if (idsToToggle.includes(task.id)) {
        const nextStatus = task.status === 'pending' ? 'in-progress' : (task.status === 'in-progress' ? 'done' : 'pending');
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const updateExtraTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleFinishMaintenance = async () => {
    if (!window.confirm('Alle erledigten Aufgaben werden gespeichert und der Plan wird zurückgesetzt. Fortfahren?')) return;
    
    setIsSubmitting(true);
    const success = await saveMaintenanceLog();
    setIsSubmitting(false);
    
    if (success) {
      alert('Wartung erfolgreich protokolliert!');
    } else {
      alert('Fehler beim Speichern der Wartung!');
    }
  };

  const fetchHistory = async () => {
    const { supabase } = await import('../../supabase');
    const { data, error } = await supabase
      .from('collini_maintenance_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setHistoryLogs(data);
    setShowHistory(true);
  };

  const allBathIds = useMemo(() => {
    const ids = [];
    Object.values(bathLayout).forEach(row => {
      row.forEach(id => {
        if (id !== 'GAP') {
          if (id.includes('-')) {
            ids.push(...id.split('-'));
          } else {
            ids.push(id);
          }
        }
      });
    });
    return [...new Set(ids)].sort();
  }, [bathLayout]);

  const [selectedIds, setSelectedIds] = useState([]);
  
  const schienenTask = tasks.find(t => t.id === 'E4');
  const isStationInRange = (stationId) => {
    if (!schienenTask) return false;
    const start = parseInt(schienenTask.startPos);
    const end = parseInt(schienenTask.endPos);
    
    const min = Math.min(start, end);
    const max = Math.max(start, end);

    if (stationId.includes('-')) {
      return stationId.split('-').some(id => {
        const val = parseInt(id);
        return val >= min && val <= max;
      });
    }
    
    const current = parseInt(stationId);
    return current >= min && current <= max;
  };
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const toggleTaskSelection = (id, event, taskList) => {
    if (event?.shiftKey && lastSelectedId && taskList) {
      const currentIndex = taskList.findIndex(t => t.id === id);
      const lastIndex = taskList.findIndex(t => t.id === lastSelectedId);
      
      if (currentIndex !== -1 && lastIndex !== -1) {
        const start = Math.min(currentIndex, lastIndex);
        const end = Math.max(currentIndex, lastIndex);
        const rangeIds = taskList.slice(start, end + 1).map(t => t.id);
        
        setSelectedIds(prev => {
          const others = prev.filter(p => !rangeIds.includes(p));
          return [...others, ...rangeIds];
        });
        setLastSelectedId(id);
        return;
      }
    }

    setSelectedIds(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) return prev.filter(i => i !== id);
      return [...prev, id];
    });
    setLastSelectedId(id);
  };

  const handleCheckboxMouseDown = (id, isSelected, event, taskList) => {
    setIsDragging(true);
    setDragMode(!isSelected ? 'select' : 'deselect');
    toggleTaskSelection(id, event, taskList);
  };

  const handleCheckboxMouseEnter = (id) => {
    if (isDragging) {
      if (dragMode === 'select') {
        setSelectedIds(prev => prev.includes(id) ? prev : [...prev, id]);
      } else {
        setSelectedIds(prev => prev.filter(i => i !== id));
      }
    }
  };

  const handleBulkUpdate = (field, value) => {
    setTasks(prev => prev.map(t => 
      selectedIds.includes(t.id) ? { ...t, [field]: value } : t
    ));
    setSelectedIds([]);
  };

  const totalEffort = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done')
      .reduce((sum, t) => sum + t.time, 0);
  }, [tasks]);

  const estimatedTimeMinutes = (totalEffort / staffCount).toFixed(0);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const doneCount = tasks.filter(t => t.status === 'done').length;
    return Math.round((doneCount / tasks.length) * 100);
  }, [tasks]);

  const renderTaskTable = (title, taskList) => {
    const tableType = taskList.length > 0 ? taskList[0].type : 'water';
    const tableSelectedIds = taskList.filter(t => selectedIds.includes(t.id)).map(t => t.id);
    const isAllSelected = taskList.length > 0 && tableSelectedIds.length === taskList.length;

    const toggleAll = () => {
      if (isAllSelected) {
        setSelectedIds(prev => prev.filter(id => !taskList.some(t => t.id === id)));
      } else {
        const newIds = taskList.map(t => t.id).filter(id => !selectedIds.includes(id));
        setSelectedIds(prev => [...prev, ...newIds]);
      }
    };

    return (
      <div className="task-table-section">
        <div className="section-header">
          <h3 className="table-section-title">{title}</h3>
          {tableSelectedIds.length > 0 && (
            <div className="bulk-actions-inline">
              <span className="selection-count">{tableSelectedIds.length}</span>
              <div className="bulk-btns-group">
                <select 
                  className="bulk-select" 
                  onChange={(e) => handleBulkUpdate('status', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Status...</option>
                  <option value="pending">GEPLANT</option>
                  <option value="in-progress">IN ARBEIT</option>
                  <option value="done">ERLEDIGT</option>
                </select>
                <select 
                  className="bulk-select" 
                  onChange={(e) => handleBulkUpdate('action', e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Aktion...</option>
                  {tableType === 'chemical' ? (
                    <>
                      <option value="Nur Analyse">Nur Analyse</option>
                      <option value="Neuansatz">Neuansatz</option>
                    </>
                  ) : (
                    <>
                      <option value="Ablassen">Ablassen</option>
                      <option value="Reinigen">Reinigen</option>
                      <option value="Befüllen">Befüllen</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="task-table-container">
          <table className="wartung-table">
            <thead>
              <tr>
                <th 
                  className="cell-id header-selection-handle" 
                  onClick={toggleAll}
                  style={{ cursor: 'pointer' }}
                >
                  {isAllSelected ? <Check size={14} style={{ color: '#3b82f6' }} /> : 'ID'}
                </th>
                <th>{t.bath}</th>
                <th>{t.action}</th>
                <th>{t.status}</th>
                <th>Zeit (min)</th>
              </tr>
            </thead>
            <tbody>
              {taskList.map(task => (
                <tr 
                  key={task.id} 
                  className={`status-${task.status} ${selectedIds.includes(task.id) ? 'selected' : ''}`}
                >
                  <td 
                    className="cell-id selection-handle" 
                    onMouseDown={(e) => handleCheckboxMouseDown(task.id, selectedIds.includes(task.id), e, taskList)}
                    onMouseEnter={() => handleCheckboxMouseEnter(task.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {selectedIds.includes(task.id) && <div className="selection-indicator" />}
                    {task.id}
                  </td>
                  <td className="cell-name" onClick={() => toggleTaskStatus(task.id)}>{task.name}</td>
                  <td className="cell-action">
                    <select 
                      className="action-select"
                      value={task.action}
                      onChange={(e) => updateTaskAction(task.id, e.target.value)}
                    >
                      {task.type === 'chemical' ? (
                        <>
                          <option value="Nur Analyse">Nur Analyse</option>
                          <option value="Neuansatz">Neuansatz</option>
                        </>
                      ) : (
                        <>
                          <option value="Ablassen">Ablassen</option>
                          <option value="Reinigen">Reinigen</option>
                          <option value="Befüllen">Befüllen</option>
                        </>
                      )}
                    </select>
                  </td>
                  <td className="cell-status" onClick={() => toggleTaskStatus(task.id)}>
                    <span className={`status-badge ${task.status}`}>
                      {task.status === 'pending' && <Circle size={14} />}
                      {task.status === 'in-progress' && <PlayCircle size={14} />}
                      {task.status === 'done' && <CheckCircle2 size={14} />}
                      {task.status === 'pending' ? t.pending : 
                       task.status === 'in-progress' ? t.inProgress : 
                       t.done}
                    </span>
                  </td>
                  <td className="cell-time" onClick={() => toggleTaskStatus(task.id)}>{task.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="wartungsplaner-module">
      <div className="wt-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => setView('hub')}>
            <ChevronLeft size={20} />
            <span>{t.back}</span>
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: 0, textTransform: 'uppercase' }}>
            {t.maintenancePlanner || 'WARTUNGSPLANER'}
            <span className="line-badge">{selectedLine || 'KS-24'}</span>
          </h1>
        </div>

        <div className="maintenance-header-actions">
          <div className="staff-selector">
            <span className="label">PERSONAL:</span>
            <div className="staff-buttons">
              {[2, 3, 4].map(num => (
                <button 
                  key={num}
                  className={staffCount === num ? 'active' : ''} 
                  onClick={() => setStaffCount(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            className={`finish-btn ${isSubmitting ? 'loading' : ''}`}
            onClick={handleFinishMaintenance}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SPEICHERN...' : 'ABSCHLIESSEN'}
          </button>

          <button className="history-trigger-btn" onClick={fetchHistory}>
            🕒
          </button>
          
          <div className="time-estimate">
            <span>{t.expected}: {estimatedTimeMinutes} min</span>
          </div>
        </div>
      </div>

      <div className="overall-progress-section">
        <div className="progress-info">
          <span className="progress-text">Wartungsfortschritt</span>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${progress}%`,
              background: progress === 100 ? 'var(--success-gradient)' : 'var(--accent-gradient)'
            }} 
          />
        </div>
      </div>

      <div className="map-and-sidebar-layout">
        <div className="machine-map-container">
          {Object.entries(bathLayout).map(([rowKey, baths]) => (
            <div key={rowKey} className={`map-row row-${rowKey}`}>
              {baths.map((id, idx) => (
                id === 'GAP' ? (
                  <div key={`gap-${idx}`} className="map-gap" />
                ) : (
                  <div 
                    key={id} 
                    className={`map-bath ${id.includes('-') ? 'double-bath' : ''} ${
                      ['2437-2438', '2439-2440', '2442-2443', '2444-2445', '2447', '2448'].includes(id) ? 'type-nickel' : 
                      ['2415-2416', '2407-2406', '2426', '2417', '2452'].includes(id) ? 'type-acid' :
                      ['2408-2409', '2410-2411', '2421', '2422'].includes(id) ? 'type-degrease' : 
                      ['2432'].includes(id) ? 'type-copper' :
                      ['2433'].includes(id) ? 'type-ni-strike' :
                      ['2453'].includes(id) ? 'type-tin' : ''
                    } status-${getBathStatus(id)} ${isStationInRange(id) ? 'has-rail-highlight' : ''}`}
                    onClick={() => {
                      if (id.includes('-')) {
                        toggleTaskStatus(id);
                      } else {
                        tasks.find(t => t.id === id) && toggleTaskStatus(id);
                      }
                    }}
                  >
                    {isStationInRange(id) && <div className="rail-highlight-bar" />}
                    {getBathStatus(id) === 'done' && <Check size={12} className="bath-done-check" />}
                    <span className="bath-id">
                      {id.includes('-') 
                        ? id.split('-').map(part => part.replace('24', '')).join('-')
                        : id.replace('24', '')
                      }
                    </span>
                  </div>
                )
              ))}
            </div>
          ))}
        </div>

        <div className="extra-tasks-sidebar">
          <div className="sidebar-header">
            <Hammer size={18} />
            <h4>Extra Aufgaben</h4>
          </div>
          <div className="extra-tasks-list">
            {tasks.filter(t => t.type === 'extra').map(task => (
              <div 
                key={task.id} 
                className={`extra-task-card status-${task.status}`}
                onClick={() => toggleTaskStatus(task.id)}
              >
                <div className="extra-task-info">
                  <span className="extra-task-name">{task.name}</span>
                  {task.id === 'E4' ? (
                    <div className="range-selector-group" onClick={e => e.stopPropagation()}>
                      <select 
                        className="pos-select"
                        value={task.startPos}
                        onChange={(e) => updateExtraTask(task.id, { startPos: e.target.value })}
                      >
                        {allBathIds.map(id => <option key={`start-${id}`} value={id}>{id.replace('24', '')}</option>)}
                      </select>
                      <span className="range-sep">bis</span>
                      <select 
                        className="pos-select"
                        value={task.endPos}
                        onChange={(e) => updateExtraTask(task.id, { endPos: e.target.value })}
                      >
                        {allBathIds.map(id => <option key={`end-${id}`} value={id}>{id.replace('24', '')}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className="extra-task-action">{task.action}</span>
                  )}
                </div>
                <div className="extra-task-status-icon">
                  {task.status === 'pending' && <Circle size={16} />}
                  {task.status === 'in-progress' && <PlayCircle size={16} />}
                  {task.status === 'done' && <CheckCircle2 size={16} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tables-grid">
        {renderTaskTable("Chemie-Bäder", tasks.filter(t => t.type === 'chemical'))}
        {renderTaskTable("Spülbäder", tasks.filter(t => t.type === 'water'))}
      </div>
      {/* History Modal */}
      {showHistory && (
        <div className="maintenance-history-overlay" onClick={() => setShowHistory(false)}>
          <div className="maintenance-history-modal" onClick={e => e.stopPropagation()}>
            <div className="history-modal-header">
              <h3>WARTUNGSPROTOKOLL</h3>
              <button className="close-btn" onClick={() => setShowHistory(false)}>×</button>
            </div>
            <div className="history-list">
              {historyLogs.map(log => (
                <div key={log.id} className="history-item">
                  <div className="item-main">
                    <span className="date">{new Date(log.created_at).toLocaleDateString('de-DE')}</span>
                    <span className="line">{log.machine_line}</span>
                    <span className="stats">
                      {log.completed_tasks}/{log.total_tasks} Aufgaben • {log.staff_count} Pers.
                    </span>
                  </div>
                  <div className="item-meta">
                    <span className="time">{log.duration_min} min</span>
                  </div>
                </div>
              ))}
              {historyLogs.length === 0 && <div className="no-history">Noch keine gespeicherten Wartungen.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wartungsplaner;
