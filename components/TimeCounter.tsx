import React, { useEffect, useState } from 'react';

const DEFAULT_START_DATE = (() => { const d = new Date(2021, 5, 15); return d; })();

interface TimeCounterProps {
  startDate?: Date | null;
}

const TimeCounter: React.FC<TimeCounterProps> = ({ startDate }) => {
  const [time, setTime] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const from = startDate ?? DEFAULT_START_DATE;

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const diff = now.getTime() - from.getTime();

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ years, months, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [from]);

  const Item = ({ value, label, isSeconds = false }: { value: number; label: string; isSeconds?: boolean }) => (
    <div className={`relative bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-lg border-b-4 border-primary text-center w-full group overflow-hidden ${isSeconds ? 'border-none' : ''}`}>
      {isSeconds && (
         <span className="material-icons-round absolute -top-3 -right-2 text-primary transform rotate-12 opacity-50">favorite</span>
      )}
      <span className="block text-3xl lg:text-4xl font-bold text-primary font-display">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-semibold">{label}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 w-full">
      <Item value={time.years} label="Years" />
      <Item value={time.months} label="Months" />
      <Item value={time.days} label="Days" />
      <Item value={time.hours} label="Hours" />
      <Item value={time.minutes} label="Minutes" />
      <Item value={time.seconds} label="Seconds" isSeconds />
    </div>
  );
};

export default TimeCounter;