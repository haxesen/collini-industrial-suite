// WTAblauf Module - Refreshed Dependencies
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Target, 
  Layers, 
  AlertCircle, 
  FileText, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Database,
  BarChart3,
  Calendar,
  LayoutDashboard,
  Loader2,
  Info
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';

const WTAblauf = () => {
  const { t, setView, selectedLine, isMobile } = useApp();
  const [mode, setMode] = useState('tracking'); 
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingLines, setSavingLines] = useState({});
  const updateTimeoutRef = useRef({});
  const [data, setData] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeShift, setActiveShift] = useState('1. Schicht');

  const shifts = {
    '1. Schicht': [6, 7, 8, 9, 10, 11, 12, 13],
    '2. Schicht': [14, 15, 16, 17, 18, 19, 20, 21],
    '3. Schicht': [22, 23, 0, 1, 2, 3, 4, 5]
  };

  const handleCountChange = (line, field, value) => {
    const numValue = parseInt(value) || 0;
    
    // Find the specific date for this row to prevent save errors if user changes day before debounce fires
    const currentRow = counts.find(c => c.line === line);
    const dateStr = currentRow?.created_at || format(selectedDate, 'yyyy-MM-dd');

    setCounts(prev => {
      // If row doesn't exist locally yet (should be rare with new 24-row logic), create it
      const exists = prev.some(c => c.line === line);
      if (!exists) {
        return [...prev, { line, count: 0, target_count: 0, magazin_count: 0, created_at: dateStr, [field]: numValue }];
      }
      return prev.map(c => c.line === line ? { ...c, [field]: numValue } : c);
    });

    const timeoutKey = `${line}-${field}`;
    if (updateTimeoutRef.current[timeoutKey]) {
      clearTimeout(updateTimeoutRef.current[timeoutKey]);
    }

    setSavingLines(prev => ({ ...prev, [timeoutKey]: 'saving' }));

    updateTimeoutRef.current[timeoutKey] = setTimeout(async () => {
      try {
        // First try to update
        const { data: updatedData, error: updateError } = await supabase
          .from('wt_tracking')
          .update({ [field]: numValue })
          .eq('line', line)
          .eq('created_at', dateStr)
          .select();

        if (updateError) throw updateError;
        
        // If 0 rows were updated, the row doesn't exist yet, so we insert it!
        if (!updatedData || updatedData.length === 0) {
          const { error: insertError } = await supabase
            .from('wt_tracking')
            .insert({
              line: line,
              count: field === 'count' ? numValue : 0,
              target_count: field === 'target_count' ? numValue : 0,
              magazin_count: field === 'magazin_count' ? numValue : 0,
              created_at: dateStr
            });
            
          if (insertError) throw insertError;
        }
        
        setSavingLines(prev => ({ ...prev, [timeoutKey]: 'saved' }));
        setTimeout(() => {
          setSavingLines(prev => {
            const newState = { ...prev };
            delete newState[timeoutKey];
            return newState;
          });
        }, 1500);
      } catch (err) {
        console.error('Error updating count:', err);
        setSavingLines(prev => ({ ...prev, [timeoutKey]: 'error' }));
      }
    }, 800); 
  };

  const fetchDailyData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      let { data: dbData, error } = await supabase
        .from('wt_tracking')
        .select('*')
        .eq('created_at', dateStr);

      if (error) throw error;

      if (!dbData || dbData.length < 24) {
        const existingLines = dbData ? dbData.map(d => Number(d.line)) : [];
        const missingRows = Array.from({ length: 24 }, (_, i) => i + 1)
          .filter(line => !existingLines.includes(line))
          .map(line => ({
            line: line,
            count: 0,
            target_count: 0,
            magazin_count: 0,
            created_at: dateStr
          }));
        
        if (missingRows.length > 0) {
          const { error: insertError } = await supabase
            .from('wt_tracking')
            .insert(missingRows);
            
          if (!insertError) {
            // Fetch again to get the complete dataset
            const { data: completeData } = await supabase.from('wt_tracking').select('*').eq('created_at', dateStr);
            if (completeData) dbData = completeData;
          }
        }
      }
      
      if (dbData) {
        const parsedData = dbData.map(d => ({ ...d, line: Number(d.line) }));
        setCounts(parsedData.sort((a, b) => a.line - b.line));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [selectedDate]);

  const fetchWeeklyData = useCallback(async () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const dateRange = eachDayOfInterval({ start, end });
    
    try {
      const { data: dbData, error } = await supabase
        .from('wt_tracking')
        .select('*')
        .gte('created_at', format(start, 'yyyy-MM-dd'))
        .lte('created_at', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      const aggregated = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        // Supabase returns timestamps like "2026-05-13T00:00:00", so we use startsWith
        const dayRecords = dbData.filter(r => r.created_at && r.created_at.startsWith(dateStr));
        return {
          date: dateStr,
          displayDate: format(date, 'dd.MM.'),
          dayName: format(date, 'EEEE', { locale: de }),
          ist: dayRecords.reduce((sum, r) => sum + (r.count || 0), 0),
          ziel: dayRecords.reduce((sum, r) => sum + (r.target_count || 0), 0),
          magazin: dayRecords.reduce((sum, r) => sum + (r.magazin_count || 0), 0)
        };
      });

      setWeeklyData(aggregated);
    } catch (err) {
      console.error('Error fetching weekly data:', err);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyData(true);
    fetchWeeklyData();

    const channel = supabase
      .channel('wt_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wt_tracking' }, (payload) => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        if (payload.new.created_at === dateStr) {
          const newLine = Number(payload.new.line);
          const timeoutKey = `${newLine}-count`;
          const targetKey = `${newLine}-target_count`;
          
          if (!updateTimeoutRef.current[timeoutKey] && !updateTimeoutRef.current[targetKey]) {
            setCounts(prev => prev.map(c => 
              c.line === newLine ? { ...payload.new, line: newLine } : c
            ));
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchDailyData, fetchWeeklyData, selectedDate]);

  const handleExportPDF = () => { window.print(); };

  const renderStats = () => {
    const totalIst = counts.reduce((sum, c) => sum + (c.count || 0), 0);
    const totalZiel = counts.reduce((sum, c) => sum + (c.target_count || 0), 0);
    const totalMagazin = counts.reduce((sum, c) => sum + (c.magazin_count || 0), 0);
    
    // Always use live local counts for today's daily efficiency, making it instantly responsive
    const dailyEfficiency = totalZiel > 0 ? Math.round((totalIst / totalZiel) * 100) : 0;

    const weeklyTotalIst = weeklyData.reduce((sum, d) => sum + (d.date === format(selectedDate, 'yyyy-MM-dd') ? totalIst : d.ist), 0);
    const weeklyTotalZiel = weeklyData.reduce((sum, d) => sum + (d.date === format(selectedDate, 'yyyy-MM-dd') ? totalZiel : d.ziel), 0);
    const weeklyTotalMagazin = weeklyData.reduce((sum, d) => sum + (d.date === format(selectedDate, 'yyyy-MM-dd') ? totalMagazin : d.magazin), 0);
    const weeklyEfficiency = weeklyTotalZiel > 0 ? Math.round((weeklyTotalIst / weeklyTotalZiel) * 100) : 0;

    const dashArray = 440;
    const dashOffset = dashArray - (dashArray * dailyEfficiency) / 100;

    return (
      <div className="stats-container animate-fade-in">
        <div className="daily-stats-grid">
          <div className="daily-hero-card">
            <div className="gauge-section">
              <div className="gauge-container">
                <svg width="160" height="160">
                  <circle className="gauge-bg" cx="80" cy="80" r="70" />
                  <circle 
                    className="gauge-fill" 
                    cx="80" cy="80" r="70" 
                    style={{ 
                      strokeDasharray: dashArray, 
                      strokeDashoffset: dashOffset,
                      stroke: dailyEfficiency >= 100 ? '#2ecc71' : 'var(--accent-cyan)'
                    }} 
                  />
                </svg>
                <div className="gauge-content">
                  <span className="percent">{dailyEfficiency}%</span>
                  <span className="label">ZIEL</span>
                </div>
              </div>
            </div>

            <div className="stats-info-section">
              <div className="hero-header">
                <Target className="text-accent" size={24} />
                <h3>Tagesübersicht</h3>
              </div>
              <div className="hero-values">
                <div className="val-box">
                  <span className="val-label">IST WT</span>
                  <span className="val-number">{totalIst}</span>
                </div>
                <div className="val-separator">/</div>
                <div className="val-box">
                  <span className="val-label">ZIEL WT</span>
                  <span className="val-number muted">{totalZiel}</span>
                </div>
              </div>
              <div className="hero-footer">
                <Clock size={16} />
                <span>Letzter Stand: {format(new Date(), 'HH:mm')}</span>
              </div>
            </div>
          </div>

          <div className="daily-side-pills">
            <div className="mini-pill-card">
              <div className="pill-icon cyan"><Layers size={24} /></div>
              <div className="pill-data">
                <span className="p-label">Magazin Total</span>
                <span className="p-value">{totalMagazin}</span>
              </div>
            </div>
            <div className="mini-pill-card">
              <div className="pill-icon green"><TrendingUp size={24} /></div>
              <div className="pill-data">
                <span className="p-label">Weekly Eff.</span>
                <span className={`p-value ${weeklyEfficiency >= 90 ? 'text-success' : ''}`}>
                  {weeklyEfficiency}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="weekly-charts-grid">
          <div className="main-chart-card">
            <div className="hero-header">
              <BarChart3 className="text-accent" size={24} />
              <h3>Wöchentliche Produktion (Bullet Chart)</h3>
            </div>
            
            <div className="weekly-bar-chart">
              {weeklyData.map((day, idx) => {
                // If it's the currently selected day, use the live data from 'counts' state
                const isSelectedDay = day.date === format(selectedDate, 'yyyy-MM-dd');
                const activeIst = isSelectedDay ? totalIst : day.ist;
                const activeZiel = isSelectedDay ? totalZiel : day.ziel;
                
                const isGoalMet = activeIst >= activeZiel && activeZiel > 0;

                // Build correct per-day values for scale calculation
                // Only substitute live counts for the SELECTED day
                const dayIstForScale = isSelectedDay ? totalIst : day.ist;
                const dayZielForScale = isSelectedDay ? totalZiel : day.ziel;

                // Calculate max value from all days' correct values
                const maxVal = Math.max(
                  ...weeklyData.map(d => {
                    const isSel = d.date === format(selectedDate, 'yyyy-MM-dd');
                    return Math.max(isSel ? totalIst : d.ist, isSel ? totalZiel : d.ziel);
                  }),
                  100
                );
                
                const hIst = (dayIstForScale / maxVal) * 100;
                const hZiel = (dayZielForScale / maxVal) * 100;

                return (
                  <div 
                    key={idx} 
                    className={`chart-column ${isSelectedDay ? 'active' : ''}`}
                    onClick={() => setSelectedDate(new Date(day.date))}
                  >
                    <div className="bar-label-dual">
                      <span className="ist">{activeIst}</span>
                      <span className="ziel">{activeZiel}</span>
                    </div>
                    <div className="bullet-chart-container">
                      <div className="bullet-bar-bg">
                        <div 
                          className="bullet-target-line" 
                          style={{ bottom: `${hZiel}%` }}
                        ></div>
                        <div 
                          className={`bullet-bar-actual ${isGoalMet ? 'goal-met' : ''}`} 
                          style={{ height: `${hIst}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="column-label">
                      <span className="day">{day.dayName.substring(0, 2).toUpperCase()}</span>
                      <span className="date">{day.displayDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="actions-card glass-panel">
            <div className="card-title"><LayoutDashboard size={18} /> Schnell-Aktionen</div>
            <div className="action-btns">
              <button onClick={handleExportPDF} className="action-btn pdf">
                <Printer size={18} /> Schichtbericht drucken
              </button>
              <button className="action-btn print">
                <FileText size={18} /> Export CSV
              </button>
            </div>
            <div className="info-box-compact">
              <AlertCircle size={20} className="text-accent" />
              <p>Der Wochenbericht wird jeden Sonntag um Mitternacht automatisch generiert.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="wt-container">
      <div className="print-only-header">
        <div className="print-header-top">
          <span className="print-app-name">Collini Industrial Suite</span>
          <span className="print-date">{format(new Date(), 'dd.MM.yyyy HH:mm')}</span>
        </div>
        <div className="print-module-title">
          <h1>WT-ABLAUF SCHICHTBERICHT</h1>
          {selectedLine && <span className="line-badge">{selectedLine}</span>}
        </div>
      </div>



      <div className="wt-header no-print">
        <div className="header-left">
          <button onClick={() => setView('hub')} className="back-btn">
            <ArrowLeft size={20} /> Zurück
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0 }}>
            WT-ABLAUF
            {selectedLine && <span className="line-badge" style={{ fontSize: '0.9rem', verticalAlign: 'middle' }}>{selectedLine}</span>}
          </h1>
        </div>
        
        <div className="header-right">
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${mode === 'tracking' ? 'active' : ''}`}
              onClick={() => setMode('tracking')}
            >
              <Database size={18} /> Erfassung
            </button>
            <button 
              className={`mode-btn ${mode === 'stats' ? 'active' : ''}`}
              onClick={() => setMode('stats')}
            >
              <BarChart3 size={18} /> Statistik
            </button>
          </div>
        </div>
      </div>

      <div className="wt-date-selector no-print">
        <button onClick={() => setSelectedDate(prev => subDays(prev, 1))} className="date-nav">
          <ChevronLeft size={24} />
        </button>
        <div className="current-date">
          <Calendar size={20} />
          <span>{format(selectedDate, 'dd.MM.yyyy')}</span>
        </div>
        <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="date-nav">
          <ChevronRight size={24} />
        </button>
      </div>

      {isMobile && (
        <div className="mobile-info-banner">
          <Info size={16} /> <span>{t.viewerMode || 'Anzeigemodus'}</span>
        </div>
      )}

      {loading ? (
        <div className="wt-loader-container animate-fade-in">
          <Loader2 className="spinner" size={48} />
          <p>Daten werden geladen...</p>
        </div>
      ) : mode === 'tracking' ? (
        <div className={`wt-content-grid ${isMobile ? 'wt-content-grid-mobile' : ''} animate-fade-in`}>
          <div className="main-table-card glass-panel">
            <div className="shift-tabs-container">
              <div className="shift-tabs-pill">
                {Object.keys(shifts).map(s => (
                  <button 
                    key={s}
                    className={`shift-tab-btn ${activeShift === s ? 'active' : ''}`}
                    onClick={() => setActiveShift(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="auto-save-indicator">
                <Database size={14} className="text-success" />
                Synchronisiert
              </div>
            </div>

            <div className="wt-table-header">
              <span>STUNDE</span>
              <span>WT ZIEL</span>
              <span>WT IST</span>
              <span>davon Magazin</span>
              <span>STATUS</span>
            </div>

            <div className="wt-table-body">
              {shifts[activeShift].map((hour, idx) => {
                const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                const rowData = counts.find(c => c.line === line) || { target_count: 0, count: 0, magazin_count: 0 };
                const isMet = rowData.count >= rowData.target_count && rowData.target_count > 0;

                return (
                  <div key={line} className="wt-row">
                    <div className="col-hour">
                      <Clock size={16} className="text-secondary" />
                      <span>{hour.toString().padStart(2, '0')}:00</span>
                      {isMet && <div className="hour-dot" />}
                    </div>
                    
                    <div className="col-target">
                      {!isMobile ? (
                        <input
                          type="number"
                          value={rowData.target_count}
                          onChange={(e) => handleCountChange(line, 'target_count', e.target.value)}
                          className={`count-input target ${savingLines[`${line}-target_count`] || ''}`}
                        />
                      ) : (
                        <div className="mobile-val-display target">{rowData.target_count}</div>
                      )}
                    </div>

                    <div className="col-ist">
                      {!isMobile ? (
                        <div className="actual-display">
                          <span className="val">{rowData.count}</span>
                          <div className="btn-group">
                            <button onClick={() => handleCountChange(line, 'count', rowData.count + 1)} className="adjust-btn plus">+</button>
                            <button onClick={() => handleCountChange(line, 'count', Math.max(0, rowData.count - 1))} className="adjust-btn minus">-</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mobile-val-display ist">{rowData.count}</div>
                      )}
                    </div>

                    <div className="col-magazin">
                      {!isMobile ? (
                        <div className="actual-display">
                          <span className="val">{rowData.magazin_count}</span>
                          <div className="btn-group">
                            <button onClick={() => handleCountChange(line, 'magazin_count', rowData.magazin_count + 1)} className="adjust-btn plus">+</button>
                            <button onClick={() => handleCountChange(line, 'magazin_count', Math.max(0, rowData.magazin_count - 1))} className="adjust-btn minus">-</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mobile-val-display">{rowData.magazin_count}</div>
                      )}
                    </div>

                    <div className="col-status">
                      {rowData.target_count > 0 ? (
                        <span className={`status-badge ${isMet ? 'met' : 'behind'}`}>
                          {isMet ? 'ERFÜLLT' : 'RÜCKSTAND'}
                        </span>
                      ) : '-'}
                    </div>
                  </div>
                );
              })}
              
              <div className="wt-row totals-row">
                <div className="col-hour">
                  <span>Gesamt</span>
                </div>
                
                <div className="col-target">
                  <div className="actual-display">
                    <span className="val">
                      {shifts[activeShift].reduce((sum, h, idx) => {
                        const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                        return sum + (counts.find(c => c.line === line)?.target_count || 0);
                      }, 0)}
                    </span>
                  </div>
                </div>

                <div className="col-ist">
                  <div className="actual-display">
                    <span className="val">
                      {shifts[activeShift].reduce((sum, h, idx) => {
                        const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                        return sum + (counts.find(c => c.line === line)?.count || 0);
                      }, 0)}
                    </span>
                  </div>
                </div>

                <div className="col-magazin">
                  <div className="actual-display">
                    <span className="val">
                      {shifts[activeShift].reduce((sum, h, idx) => {
                        const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                        return sum + (counts.find(c => c.line === line)?.magazin_count || 0);
                      }, 0)}
                    </span>
                  </div>
                </div>

                <div className="col-status">
                  {(() => {
                    const totalTarget = shifts[activeShift].reduce((sum, h, idx) => {
                      const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                      return sum + (counts.find(c => c.line === line)?.target_count || 0);
                    }, 0);
                    const totalIst = shifts[activeShift].reduce((sum, h, idx) => {
                      const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                      return sum + (counts.find(c => c.line === line)?.count || 0);
                    }, 0);
                    
                    if (totalTarget === 0) return <span>-</span>;
                    const isMet = totalIst >= totalTarget;
                    return (
                      <span className={`status-badge ${isMet ? 'met' : 'behind'}`}>
                        {isMet ? 'ERFÜLLT' : 'RÜCKSTAND'}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="stats-sidebar glass-panel">
            <div className="wt-stats-card">
              <div className="card-title"><TrendingUp size={18} /> Schicht-Effizienz</div>
              <div className="efficiency-box">
                <div className="efficiency-value">
                  {Math.round((shifts[activeShift].reduce((sum, h, idx) => {
                    const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                    return sum + (counts.find(c => c.line === line)?.count || 0);
                  }, 0) / Math.max(1, shifts[activeShift].reduce((sum, h, idx) => {
                    const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                    return sum + (counts.find(c => c.line === line)?.target_count || 0);
                  }, 0))) * 100)}%
                </div>
                <div className="efficiency-label">Zielerreichung</div>
                <div className="efficiency-progress-bg">
                  <div className="efficiency-progress-fill" style={{ 
                    width: `${Math.min(100, (shifts[activeShift].reduce((sum, h, idx) => {
                      const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                      return sum + (counts.find(c => c.line === line)?.count || 0);
                    }, 0) / Math.max(1, shifts[activeShift].reduce((sum, h, idx) => {
                      const line = idx + 1 + (activeShift === '2. Schicht' ? 8 : activeShift === '3. Schicht' ? 16 : 0);
                      return sum + (counts.find(c => c.line === line)?.target_count || 0);
                    }, 0))) * 100)}%`,
                    background: 'var(--accent-gradient)'
                  }} />
                </div>
              </div>

              <div className="info-box-compact">
                <AlertCircle size={20} className="text-accent" />
                <p>Daten werden nach jeder Änderung automatisch gespeichert.</p>
              </div>
              
              <button onClick={handleExportPDF} className="action-btn pdf" style={{ width: '100%' }}>
                <Printer size={18} /> Schichtbericht
              </button>
            </div>
          </div>
        </div>
      ) : renderStats()}

      {/* styles moved to index.css */}

    </div>
  );
};

export default WTAblauf;
