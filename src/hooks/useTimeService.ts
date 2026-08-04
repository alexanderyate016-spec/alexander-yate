import { useState, useEffect } from 'react';
import { TimeService, DayPeriod, DayPeriodInfo } from '../services/TimeService';

export interface TimeServiceState {
  now: Date;
  dateStr: string;
  clockStr: string;
  shortClockStr: string;
  fullDateStr: string;
  period: DayPeriod;
  periodInfo: DayPeriodInfo;
  greeting: string;
  shortGreeting: string;
  icon: string;
  isNight: boolean;
}

export function useTimeService(userName: string = 'Alex'): TimeServiceState {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const period = TimeService.getDayPeriod(now);
  const periodInfo = TimeService.getPeriodInfo(now, userName);
  const dateStr = TimeService.formatDateISO(now);
  const clockStr = TimeService.formatClock(now, true);
  const shortClockStr = TimeService.formatClock(now, false);
  const fullDateStr = TimeService.formatFullDate(now);

  const greeting = periodInfo.holidayGreeting || periodInfo.greeting;
  const shortGreeting = periodInfo.shortGreeting;
  const icon = periodInfo.icon;
  const isNight = period === 'night';

  return {
    now,
    dateStr,
    clockStr,
    shortClockStr,
    fullDateStr,
    period,
    periodInfo,
    greeting,
    shortGreeting,
    icon,
    isNight
  };
}
