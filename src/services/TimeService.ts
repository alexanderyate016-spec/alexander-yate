import { checkColombianHoliday, HolidayInfo } from '../utils/colombianHolidays';

export type DayPeriod = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'night';

export interface DayPeriodInfo {
  period: DayPeriod;
  icon: string;
  label: string;
  greeting: string;
  shortGreeting: string;
  colombianHoliday: HolidayInfo;
  holidayGreeting?: string;
  atmosphere: {
    bgGradient: string;
    appBgClass: string;
    headerAccent: string;
    cardBgClass: string;
    borderColor: string;
    textColor: string;
    skyGradient: string;
    sunMoonPosition: string;
    lightRayOpacity: number;
  };
}

export class TimeService {
  /**
   * Determine day period according to exact user thresholds:
   * 🌅 Amanecer: 05:00–06:59
   * ☀️ Mañana: 07:00–11:59
   * 🌤 Mediodía: 12:00–14:59
   * 🌇 Tarde: 15:00–17:59
   * 🌆 Atardecer: 18:00–19:29
   * 🌙 Noche: 19:30–04:59
   */
  static getDayPeriod(date: Date = new Date()): DayPeriod {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // 05:00 = 300, 06:59 = 419
    if (totalMinutes >= 300 && totalMinutes < 420) {
      return 'dawn';
    }
    // 07:00 = 420, 11:59 = 719
    if (totalMinutes >= 420 && totalMinutes < 720) {
      return 'morning';
    }
    // 12:00 = 720, 14:59 = 899
    if (totalMinutes >= 720 && totalMinutes < 900) {
      return 'midday';
    }
    // 15:00 = 900, 17:59 = 1079
    if (totalMinutes >= 900 && totalMinutes < 1080) {
      return 'afternoon';
    }
    // 18:00 = 1080, 19:29 = 1169
    if (totalMinutes >= 1080 && totalMinutes < 1170) {
      return 'sunset';
    }
    // 19:30 = 1170 to 04:59 = 299
    return 'night';
  }

  static getPeriodInfo(date: Date = new Date(), userName: string = 'Alex'): DayPeriodInfo {
    const period = this.getDayPeriod(date);
    const dateStr = this.formatDateISO(date);
    const holiday = checkColombianHoliday(dateStr);

    let icon = '☀️';
    let label = 'Mañana';
    let greeting = `Buenos días, ${userName}.`;
    let shortGreeting = 'Buenos días';

    let bgGradient = 'from-sky-100 via-amber-50 to-orange-50';
    let appBgClass = 'bg-[#F9F7F2]';
    let headerAccent = 'border-[#C5A059]';
    let cardBgClass = 'bg-[#FAF8F5]';
    let borderColor = 'border-[#E2DCCE]';
    let textColor = 'text-[#1A1A1A]';
    let skyGradient = 'from-[#3A7BD5] via-[#3A7BD5]/60 to-[#FEE140]';
    let sunMoonPosition = 'bottom-3 left-10';
    let lightRayOpacity = 0.5;

    switch (period) {
      case 'dawn':
        icon = '🌅';
        label = 'Amanecer';
        greeting = `Buenos días, ${userName}. Que tengas un excelente comienzo de jornada.`;
        shortGreeting = 'Buenos días';
        bgGradient = 'from-blue-900/10 via-amber-900/10 to-orange-950/20';
        appBgClass = 'bg-[#F4EFE6]';
        headerAccent = 'border-amber-500';
        cardBgClass = 'bg-[#F8F4EC]';
        borderColor = 'border-amber-200/60';
        skyGradient = 'from-[#1a365d] via-[#7c2d12] to-[#fdba74]';
        sunMoonPosition = 'bottom-2 left-1/4';
        lightRayOpacity = 0.6;
        break;

      case 'morning':
        icon = '☀️';
        label = 'Mañana';
        greeting = `Buenos días, ${userName}.`;
        shortGreeting = 'Buenos días';
        bgGradient = 'from-sky-50 via-blue-50 to-[#F9F7F2]';
        appBgClass = 'bg-[#F9F7F2]';
        headerAccent = 'border-[#C5A059]';
        cardBgClass = 'bg-white/90';
        borderColor = 'border-[#D1C7B7]';
        skyGradient = 'from-[#1e3a8a] via-[#3b82f6] to-[#93c5fd]';
        sunMoonPosition = 'bottom-12 left-1/3';
        lightRayOpacity = 0.8;
        break;

      case 'midday':
        icon = '🌤';
        label = 'Mediodía';
        greeting = `Buenas tardes, ${userName}.`;
        shortGreeting = 'Buenas tardes';
        bgGradient = 'from-amber-50/60 via-[#F9F7F2] to-sky-50/50';
        appBgClass = 'bg-[#FAFAFA]';
        headerAccent = 'border-amber-400';
        cardBgClass = 'bg-white';
        borderColor = 'border-slate-200';
        skyGradient = 'from-[#2563eb] via-[#60a5fa] to-[#e0f2fe]';
        sunMoonPosition = 'top-3 left-1/2 -translate-x-1/2';
        lightRayOpacity = 1.0;
        break;

      case 'afternoon':
        icon = '🌇';
        label = 'Tarde';
        greeting = `Buenas tardes, ${userName}.`;
        shortGreeting = 'Buenas tardes';
        bgGradient = 'from-amber-100/40 via-orange-50/30 to-[#F9F7F2]';
        appBgClass = 'bg-[#F8F5EE]';
        headerAccent = 'border-amber-600';
        cardBgClass = 'bg-[#FAF7F0]';
        borderColor = 'border-amber-200';
        skyGradient = 'from-[#1d4ed8] via-[#ea580c] to-[#fde047]';
        sunMoonPosition = 'bottom-10 right-1/3';
        lightRayOpacity = 0.7;
        break;

      case 'sunset':
        icon = '🌆';
        label = 'Atardecer';
        greeting = `Buenas tardes, ${userName}.`;
        shortGreeting = 'Buenas tardes';
        bgGradient = 'from-purple-950/10 via-amber-950/10 to-rose-950/10';
        appBgClass = 'bg-[#F3EFEA]';
        headerAccent = 'border-purple-500';
        cardBgClass = 'bg-[#F5EFF8]';
        borderColor = 'border-purple-200/80';
        skyGradient = 'from-[#4c1d95] via-[#b91c1c] to-[#f97316]';
        sunMoonPosition = 'bottom-1 right-1/4';
        lightRayOpacity = 0.6;
        break;

      case 'night':
        icon = '🌙';
        label = 'Noche';
        greeting = `Buenas noches, ${userName}.`;
        shortGreeting = 'Buenas noches';
        bgGradient = 'from-slate-950 via-blue-950 to-slate-900';
        appBgClass = 'bg-[#0B1528] text-slate-100';
        headerAccent = 'border-[#C5A059]';
        cardBgClass = 'bg-[#132337]/90 text-slate-100';
        borderColor = 'border-white/10';
        textColor = 'text-slate-100';
        skyGradient = 'from-[#030712] via-[#0b1329] to-[#1e1b4b]';
        sunMoonPosition = 'top-4 right-12';
        lightRayOpacity = 0.3;
        break;
    }

    let holidayGreeting: string | undefined = undefined;
    if (holiday.isHoliday && holiday.name) {
      if (period === 'night') {
        holidayGreeting = `Buenas noches, ${userName}. Hoy ha sido festivo nacional: ${holiday.name}. Esperamos hayas descansado.`;
      } else {
        holidayGreeting = `¡Feliz día festivo! Hoy celebramos ${holiday.name}, ${userName}.`;
      }
    }

    return {
      period,
      icon,
      label,
      greeting,
      shortGreeting,
      colombianHoliday: holiday,
      holidayGreeting,
      atmosphere: {
        bgGradient,
        appBgClass,
        headerAccent,
        cardBgClass,
        borderColor,
        textColor,
        skyGradient,
        sunMoonPosition,
        lightRayOpacity
      }
    };
  }

  static formatDateISO(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static formatFullDate(date: Date = new Date()): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const dayName = days[date.getDay()];
    const dayNumber = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${dayNumber} de ${monthName} de ${year}`;
  }

  static formatClock(date: Date = new Date(), showSeconds: boolean = true): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  }
}
