import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './CustomDateTimePicker.css';

const CustomDateTimePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [tempTime, setTempTime] = useState({ h: '12', m: '00' });
  
  const containerRef = useRef(null);

  const isValidDate = (d) => d instanceof Date && !isNaN(d);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (isValidDate(d)) {
        setSelectedDate(d);
        setTempTime({
          h: d.getHours().toString().padStart(2, '0'),
          m: d.getMinutes().toString().padStart(2, '0')
        });
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleApply = (e) => {
    if (e) e.stopPropagation();
    if (!selectedDate) return;
    const finalDate = new Date(selectedDate);
    finalDate.setHours(parseInt(tempTime.h), parseInt(tempTime.m));
    onChange(finalDate.toISOString());
    setIsOpen(false);
  };

  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = selectedDate && isValidDate(selectedDate) &&
                        selectedDate.getDate() === d && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === year;
      const isToday = new Date().getDate() === d && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;

      days.push(
        <div 
          key={d} 
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => handleDateClick(d)}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  const formatDisplay = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (!isValidDate(d)) return '';
    const dateStr = d.toLocaleDateString('de-DE');
    const timeStr = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  };

  const pickerModal = (
    <div className="dt-picker-overlay" onClick={() => setIsOpen(false)}>
      <div className="dt-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dt-picker-modal-header">
          <h3>Datum & Zeit wählen</h3>
          <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
        </div>
        
        <div className="dt-picker-content">
          <div className="calendar-section">
            <div className="dt-picker-nav">
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}>
                <ChevronLeft size={20} />
              </button>
              <span className="current-month">
                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="calendar-grid">
              {weekdays.map(w => <div key={w} className="weekday-label">{w}</div>)}
              {renderCalendar()}
            </div>
          </div>

          <div className="time-section">
            <div className="time-picker-label">
              <Clock size={16} /> Uhrzeit
            </div>
            <div className="time-input-group">
              <input 
                type="number" 
                min="0" max="23" 
                value={tempTime.h}
                onChange={(e) => setTempTime({...tempTime, h: e.target.value.padStart(2, '0')})}
              />
              <span>:</span>
              <input 
                type="number" 
                min="0" max="59" 
                value={tempTime.m}
                onChange={(e) => setTempTime({...tempTime, m: e.target.value.padStart(2, '0')})}
              />
            </div>
          </div>
        </div>

        <div className="dt-picker-actions">
          <button className="dt-btn clear" onClick={() => { onChange(null); setIsOpen(false); }}>
            Löschen
          </button>
          <button className="dt-btn cancel" onClick={() => setIsOpen(false)}>
            Abbrechen
          </button>
          <button className="dt-btn apply" onClick={handleApply}>
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="custom-dt-container" ref={containerRef}>
      {label && <label className="dt-label">{label}</label>}
      <div className="dt-input-wrapper" onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>
        <input 
          type="text" 
          readOnly 
          value={formatDisplay(value)} 
          placeholder="Datum wählen..."
          className="dt-display-input"
        />
        <CalendarIcon size={18} className="dt-icon" />
      </div>

      {isOpen && createPortal(pickerModal, document.body)}
    </div>
  );
};

export default CustomDateTimePicker;
