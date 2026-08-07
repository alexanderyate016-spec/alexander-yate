import { useState, useEffect } from 'react';
import { TimeService, DayPeriod, DayPeriodInfo } from '../services/TimeService';

export interface TimeServiceState {
  now: Date;
  dateStr: string;
  clockStr: string;
  shortClockStr: string;
  fullDateStr: string;
  weekNumber: number;
  period: DayPeriod;
  periodInfo: DayPeriodInfo;
  greeting: string;
  shortGreeting: string;
  icon: string;
  isNight: boolean;
  forcedPeriod: DayPeriod | 'auto';
  setForcedPeriod: (period: DayPeriod | 'auto') => void;
}

export function useTimeService(userName: string = 'Alex'): TimeServiceState {
  const [now, setNow] = useState<Date>(new Date());
  const [forcedPeriod, setForcedPeriod] = useState<DayPeriod | 'auto'>('auto');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Determine effective period
  const realPeriod = TimeService.getDayPeriod(now);
  const effectivePeriod = forcedPeriod === 'auto' ? realPeriod : forcedPeriod;

  // Build effective date or info matching the forced period if active
  let effectiveDate = now;
  if (forcedPeriod !== 'auto') {
    const simulated = new Date(now);
    switch (forcedPeriod) {
      case 'dawn':
        simulated.setHours(6, 30, 0);
        break;
      case 'morning':
        simulated.setHours(9, 30, 0);
        break;
      case 'midday':
        simulated.setHours(13, 0, 0);
        break;
      case 'sunset':
        simulated.setHours(18, 15, 0);
        break;
      case 'dusk':
        simulated.setHours(20, 0, 0);
        break;
      case 'night':
        simulated.setHours(22, 30, 0);
        break;
    }
    effectiveDate = simulated;
  }

  const periodInfo = TimeService.getPeriodInfo(effectiveDate, userName);
  const dateStr = TimeService.formatDateISO(effectiveDate);
  const clockStr = TimeService.formatClock(now, true);
  const shortClockStr = TimeService.formatClock(now, false);
  const fullDateStr = TimeService.formatFullDate(effectiveDate);
  const weekNumber = TimeService.getWeekNumber(effectiveDate);

  const greeting = periodInfo.holidayGreeting || periodInfo.greeting;
  const shortGreeting = periodInfo.shortGreeting;
  const icon = periodInfo.icon;
  const isNight = effectivePeriod === 'night' || effectivePeriod === 'dusk';

  // Synchronize document attribute for global CSS variable adaptation
  useEffect(() => {
    document.documentElement.setAttribute('data-time-period', effectivePeriod);
  }, [effectivePeriod]);

  return {
    now,
    dateStr,
    clockStr,
    shortClockStr,
    fullDateStr,
    weekNumber,
    period: effectivePeriod,
    periodInfo,
    greeting,
    shortGreeting,
    icon,
    isNight,
    forcedPeriod,
    setForcedPeriod
  };
}
