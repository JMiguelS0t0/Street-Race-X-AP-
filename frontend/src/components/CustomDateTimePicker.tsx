import { useState, useEffect, useRef } from 'react';

interface CustomDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const MONTHS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function CustomDateTimePicker({ value, onChange }: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  const [selectedHour, setSelectedHour] = useState(12);
  const [selectedMinute, setSelectedMinute] = useState(0);

  useEffect(() => {
    if (value) {
      const parsedDate = new Date(value);
      if (!isNaN(parsedDate.getTime())) {
        setCurrentYear(parsedDate.getFullYear());
        setCurrentMonth(parsedDate.getMonth());
        setSelectedDay(parsedDate.getDate());
        setSelectedHour(parsedDate.getHours());
        setSelectedMinute(parsedDate.getMinutes());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    triggerChange(day, selectedHour, selectedMinute);
  };

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour);
    triggerChange(selectedDay, hour, selectedMinute);
  };

  const handleMinuteChange = (minute: number) => {
    setSelectedMinute(minute);
    triggerChange(selectedDay, selectedHour, minute);
  };

  const triggerChange = (day: number, hour: number, minute: number) => {
    const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
    onChange(dateStr);
  };

  const displayValue = value 
    ? `${currentYear}-${pad(currentMonth + 1)}-${pad(selectedDay)} ${pad(selectedHour)}:${pad(selectedMinute)}`
    : 'SELECCIONAR FECHA Y HORA';

  const daysArray = Array.from({ length: daysInMonth }, (_, idx) => idx + 1);
  const paddingArray = Array.from({ length: firstDay }, (_, idx) => idx);

  return (
    <div ref={containerRef} className="relative w-full font-mono">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#131313] border border-outline-variant text-[13px] text-on-surface p-2.5 outline-none focus:border-primary-container cursor-pointer flex justify-between items-center select-none"
      >
        <span>{displayValue}</span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">calendar_month</span>
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 z-50 bg-[#20201f] border border-outline-variant p-4 header-notch shadow-[0_0_24px_rgba(255,87,25,0.25)] flex flex-col gap-3 min-w-[280px] w-full">
          <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
            <button 
              type="button" 
              onClick={handlePrevMonth}
              className="text-on-surface-variant hover:text-primary-container cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-[11px] font-bold text-primary-container">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth}
              className="text-on-surface-variant hover:text-primary-container cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-on-surface-variant mb-1">
            {WEEKDAYS.map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {paddingArray.map((_, idx) => (
              <div key={`pad-${idx}`} className="p-1" />
            ))}
            {daysArray.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <div
                  key={`day-${day}`}
                  onClick={() => handleSelectDay(day)}
                  className={`p-1 hover:bg-surface-variant cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_6px_#ff5719]' 
                      : 'text-on-surface'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 items-center justify-center border-t border-outline-variant/30 pt-3 mt-1">
            <span className="text-[9px] text-on-surface-variant font-bold uppercase">HORA:</span>
            <select
              value={selectedHour}
              onChange={(e) => handleHourChange(parseInt(e.target.value))}
              className="bg-[#131313] border border-outline-variant text-[11px] text-on-surface p-1 outline-none focus:border-primary-container"
            >
              {Array.from({ length: 24 }, (_, idx) => (
                <option key={idx} value={idx}>{pad(idx)}</option>
              ))}
            </select>

            <span className="text-[9px] text-on-surface-variant font-bold uppercase">:</span>

            <select
              value={selectedMinute}
              onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
              className="bg-[#131313] border border-outline-variant text-[11px] text-on-surface p-1 outline-none focus:border-primary-container"
            >
              {Array.from({ length: 60 }, (_, idx) => (
                <option key={idx} value={idx}>{pad(idx)}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto bg-primary-container text-on-primary-container text-[9px] font-bold px-3 py-1.5 skew-x-[-12deg] hover:bg-primary cursor-pointer"
            >
              <span className="skew-x-[12deg] block">OK</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
