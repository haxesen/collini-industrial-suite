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
  LayoutDashboard
} from 'lucide-react';
import { supabase } from '../../supabase';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { useApp } from '../../context/AppContext';

const WTAblauf = () => {
  const { t, setView, selectedLine } = useApp();
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
    const end = selectedDate;
    const start = subDays(end, 6);
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
          displayDate: format(date, 'MM. dd.'),
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
                // Calculate max value dynamically but always at least 100 to maintain chart scale
                const maxVal = Math.max(
                  ...weeklyData.map(d => Math.max(d.date === format(selectedDate, 'yyyy-MM-dd') ? totalIst : d.ist, d.date === format(selectedDate, 'yyyy-MM-dd') ? totalZiel : d.ziel)), 
                  100
                );
                
                const hIst = (activeIst / maxVal) * 100;
                const hZiel = (activeZiel / maxVal) * 100;

                return (
                  <div key={idx} className="chart-column">
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
      <div className="wt-header no-print">
        <div className="header-left">
          <button onClick={() => setView('dashboard')} className="back-btn">
            <ArrowLeft size={20} /> Zurück
          </button>
          <div>
            <h1>WT-ABLAUF</h1>
            <p>Stündliche Verfolgung der Warenträger - KS-24</p>
          </div>
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
          <span>{format(selectedDate, 'yyyy. MM. dd.')}</span>
        </div>
        <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="date-nav">
          <ChevronRight size={24} />
        </button>
      </div>

      {mode === 'tracking' ? (
        <div className="wt-content-grid animate-fade-in">
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
                      <input
                        type="number"
                        value={rowData.target_count}
                        onChange={(e) => handleCountChange(line, 'target_count', e.target.value)}
                        className={`count-input target ${savingLines[`${line}-target_count`] || ''}`}
                      />
                    </div>

                    <div className="col-ist">
                      <div className="actual-display">
                        <span className="val">{rowData.count}</span>
                        <div className="btn-group">
                          <button onClick={() => handleCountChange(line, 'count', rowData.count + 1)} className="adjust-btn plus">+</button>
                          <button onClick={() => handleCountChange(line, 'count', Math.max(0, rowData.count - 1))} className="adjust-btn minus">-</button>
                        </div>
                      </div>
                    </div>

                    <div className="col-magazin">
                      <div className="actual-display">
                        <span className="val">{rowData.magazin_count}</span>
                        <div className="btn-group">
                          <button onClick={() => handleCountChange(line, 'magazin_count', rowData.magazin_count + 1)} className="adjust-btn plus">+</button>
                          <button onClick={() => handleCountChange(line, 'magazin_count', Math.max(0, rowData.magazin_count - 1))} className="adjust-btn minus">-</button>
                        </div>
                      </div>
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
                <p>Az adatok automatikusan mentésre kerülnek minden módosítás után.</p>
              </div>
              
              <button onClick={handleExportPDF} className="action-btn pdf" style={{ width: '100%' }}>
                <Printer size={18} /> Schichtbericht
              </button>
            </div>
          </div>
        </div>
      ) : renderStats()}

      <style jsx>{`
        .wt-container {
          padding: 20px;
          max-width: 1850px;
          margin: 0 auto;
          color: #fff;
        }

        .wt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .header-left { display: flex; align-items: center; gap: 20px; }
        .back-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 10px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.1); }
        h1 { font-size: 2rem; font-weight: 900; margin: 0; letter-spacing: -1px; }
        .header-left p { color: var(--text-secondary); margin: 0; font-size: 0.9rem; }

        .wt-date-selector {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          background: rgba(255,255,255,0.03);
          padding: 15px;
          border-radius: 20px;
          margin-bottom: 30px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .current-date {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.4rem;
          font-weight: 800;
        }

        .date-nav {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.2s;
        }
        .date-nav:hover { color: var(--accent-cyan); }

        .glass-panel {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }

        .wt-content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          margin-top: 20px;
        }

        .shift-tabs-container {
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .shift-tabs-pill {
          display: flex;
          background: rgba(255,255,255,0.05);
          padding: 5px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .shift-tab-btn {
          padding: 8px 24px;
          border: none;
          background: none;
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shift-tab-btn.active {
          background: var(--accent-gradient);
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 153, 255, 0.3);
        }

        .auto-save-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.7rem;
          color: var(--text-secondary);
          background: rgba(255,255,255,0.03);
          padding: 6px 12px;
          border-radius: 20px;
        }

        .wt-table-header {
          display: grid;
          grid-template-columns: 150px 150px 1fr 1fr 180px;
          padding: 20px 25px;
          border-bottom: 2px solid rgba(255,255,255,0.05);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 700;
          text-align: center;
        }

        .wt-row {
          display: grid;
          grid-template-columns: 150px 150px 1fr 1fr 180px;
          align-items: center;
          padding: 16px 25px;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.2s;
        }

        .wt-row.totals-row {
          background: linear-gradient(90deg, rgba(0, 242, 254, 0.05) 0%, rgba(0, 153, 255, 0.05) 100%);
          border-top: 1px solid rgba(0, 242, 254, 0.2);
          border-bottom: none;
          margin-top: 15px;
          border-radius: 12px;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
          position: relative;
        }
        
        .wt-row.totals-row::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(0, 242, 254, 0.8) 50%, transparent 100%);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
        }

        .totals-row .col-hour span {
          background: var(--accent-gradient);
          color: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          box-shadow: 0 4px 10px rgba(0, 153, 255, 0.3);
        }

        .totals-row .actual-display {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(0, 242, 254, 0.2);
          padding: 12px 15px;
          border-radius: 14px;
          justify-content: center;
          min-width: 100px;
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.5);
        }

        .totals-row .actual-display .val {
          color: #fff;
          font-size: 2rem;
          font-weight: 900;
          text-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
        }

        .wt-row:hover:not(.totals-row) { background: rgba(255,255,255,0.02); }

        .col-hour {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #fff;
        }

        .hour-dot {
          width: 8px;
          height: 8px;
          background: #2ecc71;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
        }

        .col-target, .col-ist, .col-magazin, .col-status {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .actual-display {
          display: flex;
          align-items: center;
          gap: 25px;
          background: rgba(255,255,255,0.03);
          padding: 8px 25px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .actual-display .val {
          font-size: 1.8rem;
          font-weight: 800;
          color: #fff;
          min-width: 40px;
          text-align: center;
        }

        .btn-group { display: flex; flex-direction: column; gap: 4px; }

        .adjust-btn {
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adjust-btn:hover { background: var(--accent-cyan); }
        .adjust-btn.plus { color: #2ecc71; }
        .adjust-btn.minus { color: #ff4757; }

        .status-badge {
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
        }

        .status-badge.met { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.2); }
        .status-badge.behind { background: rgba(255, 71, 87, 0.1); color: #ff4757; border: 1px solid rgba(255, 71, 87, 0.2); }

        .count-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #fff;
          width: 100px;
          padding: 12px;
          text-align: center;
          font-size: 1.4rem;
          font-weight: 700;
          transition: all 0.3s;
        }

        .count-input:focus {
          outline: none;
          background: rgba(255,255,255,0.1);
          border-color: var(--accent-cyan);
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.2);
        }

        .count-input.saving { border-color: var(--accent-cyan); animation: pulse-border 1s infinite; }
        .count-input.saved { border-color: #2ecc71; background: rgba(46, 204, 113, 0.1); }
        .count-input.error { border-color: #ff4757; background: rgba(255, 71, 87, 0.1); }

        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 242, 254, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 242, 254, 0); }
        }

        .mode-toggle { display: flex; background: rgba(255,255,255,0.05); padding: 4px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        .mode-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: none; color: var(--text-secondary); border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .mode-btn.active { background: var(--accent-gradient); color: #fff; }

        .wt-stats-card { padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .card-title { display: flex; align-items: center; gap: 10px; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; }
        .efficiency-box { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 16px; text-align: center; border: 1px solid rgba(255,255,255,0.05); }
        .efficiency-value { font-size: 3.5rem; font-weight: 900; line-height: 1; margin-bottom: 5px; color: #fff; text-shadow: 0 0 20px rgba(0, 153, 255, 0.4); }
        .efficiency-label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 15px; text-transform: uppercase; }
        .efficiency-progress-bg { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
        .efficiency-progress-fill { height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

        .info-box-compact { display: flex; gap: 12px; background: rgba(0, 242, 254, 0.05); padding: 12px; border-radius: 12px; border: 1px solid rgba(0, 242, 254, 0.1); }
        .info-box-compact p { font-size: 0.7rem; line-height: 1.4; color: var(--text-secondary); }

        .actions-card { padding: 35px; display: flex; flex-direction: column; gap: 20px; }
        .action-btns { display: flex; flex-direction: column; gap: 15px; }

        .action-btn { 
          display: flex; align-items: center; justify-content: center; gap: 12px; 
          padding: 16px; border-radius: 14px; font-weight: 800; font-size: 0.95rem; 
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
          text-transform: uppercase; letter-spacing: 1px;
        }

        .action-btn.pdf { 
          background: rgba(0, 242, 254, 0.1); 
          color: var(--accent-cyan); 
          border: 1px solid rgba(0, 242, 254, 0.2); 
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .action-btn.pdf:hover { 
          background: var(--accent-gradient); 
          color: #fff; 
          border-color: transparent;
          transform: translateY(-2px); 
          box-shadow: 0 10px 25px rgba(0, 153, 255, 0.4); 
        }

        .action-btn.print { 
          background: rgba(255, 255, 255, 0.03); 
          color: #fff; 
          border: 1px solid rgba(255, 255, 255, 0.1); 
        }
        .action-btn.print:hover { 
          background: rgba(255, 255, 255, 0.08); 
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Stats Styles */
        .daily-stats-grid { display: grid; grid-template-columns: 1fr 380px; gap: 30px; margin-bottom: 30px; }
        .daily-hero-card { padding: 35px 50px; display: flex; align-items: center; justify-content: space-around; gap: 50px; background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%); border-radius: 24px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .gauge-section { width: 160px; height: 160px; flex-shrink: 0; }
        .gauge-container { position: relative; width: 100%; height: 100%; }
        .gauge-container svg { transform: rotate(-90deg); filter: drop-shadow(0 0 10px rgba(0, 153, 255, 0.3)); }
        .gauge-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 10; }
        .gauge-fill { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .gauge-content { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; }
        .gauge-content .percent { font-size: 2.6rem; font-weight: 900; color: #fff; line-height: 1; }
        .gauge-content .label { font-size: 0.6rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 2px; }

        .stats-info-section { flex: 1; }
        .hero-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
        .hero-header h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-secondary); margin: 0; text-transform: uppercase; letter-spacing: 1px; }
        .text-accent { color: var(--accent-cyan); }

        .hero-values { display: flex; align-items: baseline; gap: 30px; margin-bottom: 25px; }
        .val-box { display: flex; flex-direction: column; }
        .val-label { font-size: 0.85rem; font-weight: 900; color: var(--text-secondary); text-transform: uppercase; }
        .val-number { font-size: 5.5rem; font-weight: 950; color: #fff; line-height: 1; }
        .val-number.muted { color: rgba(255,255,255,0.15); font-size: 3.5rem; }
        .val-separator { font-size: 3.5rem; color: rgba(255,255,255,0.05); }

        .daily-side-pills { display: flex; flex-direction: column; gap: 20px; }
        .mini-pill-card { display: flex; align-items: center; gap: 25px; padding: 25px; background: rgba(255,255,255,0.03); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .pill-icon { width: 54px; height: 54px; border-radius: 15px; display: flex; align-items: center; justify-content: center; }
        .pill-icon.cyan { background: rgba(0, 242, 254, 0.1); color: var(--accent-cyan); }
        .pill-icon.green { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
        
        .weekly-charts-grid { display: grid; grid-template-columns: 1fr 380px; gap: 30px; margin-top: 20px; }
        .main-chart-card { padding: 35px; min-height: 550px; display: flex; flex-direction: column; background: rgba(255,255,255,0.02); border-radius: 24px; }
        .weekly-bar-chart { flex: 1; display: flex; justify-content: space-around; align-items: flex-end; padding: 40px 20px; gap: 15px; height: 500px; }
        .chart-column { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; }
        .bullet-chart-container { width: 90px; height: 380px; position: relative; flex-shrink: 0; }
        .bullet-bar-bg { width: 100%; height: 100%; background: rgba(255,255,255,0.02); border-radius: 12px; position: relative; border: 1px solid rgba(255,255,255,0.04); }
        .bullet-target-line { position: absolute; left: -8px; right: -8px; height: 4px; background: #fff; z-index: 10; box-shadow: 0 0 15px rgba(255,255,255,0.6); border-radius: 4px; }
        .bullet-bar-actual { position: absolute; bottom: 0; left: 15px; right: 15px; background: linear-gradient(to top, #0099ff, #00f2fe); border-radius: 6px; transition: height 1s cubic-bezier(0.4, 0, 0.2, 1); z-index: 5; }
        .bullet-bar-actual.goal-met { background: linear-gradient(to top, #2ecc71, #a8ff78); }
        .bar-label-dual { margin-bottom: 8px; text-align: center; display: flex; flex-direction: column; }
        .bar-label-dual .ist { font-size: 1.8rem; font-weight: 950; color: #fff; }
        .bar-label-dual .ziel { font-size: 1rem; font-weight: 800; color: var(--text-secondary); }
        .column-label { margin-top: 15px; display: flex; flex-direction: column; align-items: center; }
        .column-label .day { font-size: 0.9rem; font-weight: 800; color: #fff; }
        .column-label .date { font-size: 0.7rem; color: var(--text-secondary); }

        .animate-fade-in { animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default WTAblauf;
