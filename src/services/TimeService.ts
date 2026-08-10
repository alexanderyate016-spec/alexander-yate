import { checkColombianHoliday, HolidayInfo } from '../utils/colombianHolidays';

export type DayPeriod = 'dawn' | 'morning' | 'midday' | 'sunset' | 'dusk' | 'night';

export interface SpecialDateInfo {
  id: string;
  isSpecial: boolean;
  name: string;
  greeting: string;
  emoji: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentBg: string;
}

export interface DayPeriodInfo {
  period: DayPeriod;
  icon: string;
  label: string;
  greeting: string;
  shortGreeting: string;
  colombianHoliday: HolidayInfo;
  specialDateInfo?: SpecialDateInfo | null;
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
    lampDefaultOn: boolean;
  };
}

export class TimeService {
  /**
   * Determine week number (ISO 8601)
   */
  static getWeekNumber(d: Date = new Date()): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Determine special dates (Navidad, San Valentín, Año Nuevo, etc.)
   */
  static getSpecialDate(date: Date = new Date(), userName: string = 'Alex'): SpecialDateInfo | null {
    const month = date.getMonth(); // 0-indexed (0 = Jan, 1 = Feb, ..., 11 = Dec)
    const day = date.getDate();

    // 1. Navidad (Dec 20 - Dec 26)
    if (month === 11 && day >= 20 && day <= 26) {
      return {
        id: 'navidad',
        isSpecial: true,
        name: 'Navidad',
        greeting: `¡Feliz Navidad, ${userName}! 🎄`,
        emoji: '🎄',
        badgeBg: 'bg-emerald-950/80',
        badgeText: 'text-emerald-200 border-emerald-500/40',
        borderColor: 'border-emerald-500/40',
        accentBg: 'from-emerald-900/40 via-red-950/30 to-amber-900/20'
      };
    }

    // 2. San Valentín (Feb 14)
    if (month === 1 && day === 14) {
      return {
        id: 'san_valentin',
        isSpecial: true,
        name: 'San Valentín',
        greeting: `Feliz San Valentín, ${userName}. ❤️`,
        emoji: '❤️',
        badgeBg: 'bg-rose-950/80',
        badgeText: 'text-rose-200 border-rose-500/40',
        borderColor: 'border-rose-500/40',
        accentBg: 'from-rose-900/40 via-pink-950/30 to-amber-900/20'
      };
    }

    // 3. Año Nuevo (Dec 31, Jan 1, Jan 2)
    if ((month === 11 && day === 31) || (month === 0 && day <= 2)) {
      return {
        id: 'ano_nuevo',
        isSpecial: true,
        name: 'Año Nuevo',
        greeting: `¡Feliz Año Nuevo, ${userName}! 🎆`,
        emoji: '🎆',
        badgeBg: 'bg-amber-950/80',
        badgeText: 'text-amber-200 border-amber-500/40',
        borderColor: 'border-amber-500/40',
        accentBg: 'from-amber-900/40 via-purple-950/30 to-sky-900/20'
      };
    }

    // 4. Halloween (Oct 31)
    if (month === 9 && day === 31) {
      return {
        id: 'halloween',
        isSpecial: true,
        name: 'Halloween',
        greeting: `¡Feliz Halloween, ${userName}! 🎃`,
        emoji: '🎃',
        badgeBg: 'bg-orange-950/80',
        badgeText: 'text-orange-200 border-orange-500/40',
        borderColor: 'border-orange-500/40',
        accentBg: 'from-orange-900/40 via-purple-950/30 to-slate-900/20'
      };
    }

    // 5. Día de la Independencia (Jul 20)
    if (month === 6 && day === 20) {
      return {
        id: 'independencia',
        isSpecial: true,
        name: 'Día de la Independencia',
        greeting: `¡Feliz Día de la Independencia, ${userName}! 🇨🇴`,
        emoji: '🇨🇴',
        badgeBg: 'bg-yellow-950/80',
        badgeText: 'text-yellow-200 border-yellow-500/40',
        borderColor: 'border-yellow-500/40',
        accentBg: 'from-yellow-900/30 via-blue-950/30 to-red-950/20'
      };
    }

    return null;
  }

  /**
   * Determine day period according to exact thresholds:
   * 🌅 Amanecer: 05:00–07:59
   * ☀️ Mañana: 08:00–11:59
   * 🌤 Mediodía/Tarde: 12:00–16:59
   * 🌇 Atardecer: 17:00–19:29
   * 🌆 Crepúsculo / Noche: 19:30–04:59
   */
  static getDayPeriod(date: Date = new Date()): DayPeriod {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes >= 300 && totalMinutes < 480) {
      return 'dawn';
    }
    if (totalMinutes >= 480 && totalMinutes < 720) {
      return 'morning';
    }
    if (totalMinutes >= 720 && totalMinutes < 1020) {
      return 'midday';
    }
    if (totalMinutes >= 1020 && totalMinutes < 1170) {
      return 'sunset';
    }
    if (totalMinutes >= 1170 && totalMinutes < 1260) {
      return 'dusk';
    }
    return 'night';
  }

  static getPeriodInfo(date: Date = new Date(), userName: string = 'Alex'): DayPeriodInfo {
    const period = this.getDayPeriod(date);
    const dateStr = this.formatDateISO(date);
    const holiday = checkColombianHoliday(dateStr);
    const specialDateInfo = this.getSpecialDate(date, userName);

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
    let skyGradient = 'from-[#1e3a8a] via-[#3b82f6] to-[#93c5fd]';
    let sunMoonPosition = 'bottom-12 left-1/3';
    let lightRayOpacity = 0.8;
    let lampDefaultOn = false;

    switch (period) {
      case 'dawn':
        icon = '🌅';
        label = 'Amanecer';
        greeting = `Buenos días, ${userName}.`;
        shortGreeting = 'Amanecer';
        bgGradient = 'from-amber-100/60 via-rose-50/50 to-orange-100/40';
        appBgClass = 'bg-[#fffaf5] text-amber-950';
        headerAccent = 'border-amber-400';
        cardBgClass = 'bg-white/95 text-amber-950';
        borderColor = 'border-amber-200';
        textColor = 'text-amber-950';
        skyGradient = 'from-amber-200 via-rose-300 to-sky-300';
        sunMoonPosition = 'bottom-3 left-1/4';
        lightRayOpacity = 0.6;
        lampDefaultOn = false;
        break;

      case 'morning':
        icon = '☀️';
        label = 'Mañana';
        greeting = `Buenos días, ${userName}.`;
        shortGreeting = 'Mañana';
        bgGradient = 'from-sky-50 via-blue-50/50 to-slate-50';
        appBgClass = 'bg-[#f0f9ff] text-slate-900';
        headerAccent = 'border-sky-300';
        cardBgClass = 'bg-white/95 text-slate-900';
        borderColor = 'border-sky-200';
        textColor = 'text-slate-900';
        skyGradient = 'from-sky-400 via-blue-400 to-indigo-300';
        sunMoonPosition = 'bottom-16 left-1/3';
        lightRayOpacity = 0.85;
        lampDefaultOn = false;
        break;

      case 'midday':
        icon = '🌤️';
        label = 'Tarde';
        greeting = `Buenas tardes, ${userName}.`;
        shortGreeting = 'Mediodía';
        bgGradient = 'from-slate-50 via-white to-sky-50/30';
        appBgClass = 'bg-slate-50 text-slate-900';
        headerAccent = 'border-purple-300';
        cardBgClass = 'bg-white text-slate-900';
        borderColor = 'border-slate-200';
        textColor = 'text-slate-900';
        skyGradient = 'from-blue-500 via-sky-400 to-blue-200';
        sunMoonPosition = 'top-3 left-1/2 -translate-x-1/2';
        lightRayOpacity = 1.0;
        lampDefaultOn = false;
        break;

      case 'sunset':
        icon = '🌇';
        label = 'Atardecer';
        greeting = `Buenas tardes, ${userName}.`;
        shortGreeting = 'Atardecer';
        bgGradient = 'from-amber-100/70 via-orange-100/50 to-rose-100/40';
        appBgClass = 'bg-[#fff7ed] text-amber-950';
        headerAccent = 'border-amber-400';
        cardBgClass = 'bg-white/95 text-amber-950';
        borderColor = 'border-amber-300';
        textColor = 'text-amber-950';
        skyGradient = 'from-orange-500 via-amber-500 to-rose-400';
        sunMoonPosition = 'bottom-4 right-1/3';
        lightRayOpacity = 0.75;
        lampDefaultOn = false;
        break;

      case 'dusk':
        icon = '🌆';
        label = 'Crepúsculo';
        greeting = `Buenas noches, ${userName}.`;
        shortGreeting = 'Crepúsculo';
        bgGradient = 'from-indigo-950 via-purple-950/80 to-slate-900';
        appBgClass = 'bg-[#1e1b4b] text-slate-100';
        headerAccent = 'border-indigo-500';
        cardBgClass = 'bg-[#312e81]/90 text-slate-100';
        borderColor = 'border-indigo-400/40';
        textColor = 'text-slate-100';
        skyGradient = 'from-purple-900 via-indigo-900 to-slate-900';
        sunMoonPosition = 'bottom-2 right-1/4';
        lightRayOpacity = 0.5;
        lampDefaultOn = true;
        break;

      case 'night':
        icon = '🌙';
        label = 'Noche';
        greeting = `Buenas noches, ${userName}.`;
        shortGreeting = 'Noche';
        bgGradient = 'from-slate-950 via-blue-950 to-slate-900';
        appBgClass = 'bg-[#090d16] text-slate-100';
        headerAccent = 'border-purple-500/50';
        cardBgClass = 'bg-[#131f37]/90 text-slate-100';
        borderColor = 'border-slate-700/60';
        textColor = 'text-slate-100';
        skyGradient = 'from-slate-950 via-indigo-950 to-slate-900';
        sunMoonPosition = 'top-4 right-12';
        lightRayOpacity = 0.25;
        lampDefaultOn = true;
        break;
    }

    let holidayGreeting: string | undefined = undefined;
    if (specialDateInfo) {
      holidayGreeting = specialDateInfo.greeting;
    } else if (holiday.isHoliday && holiday.name) {
      if (period === 'night' || period === 'dusk') {
        holidayGreeting = `Buenas noches, ${userName}. Hoy ha sido festivo nacional: ${holiday.name}.`;
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
      specialDateInfo,
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
        lightRayOpacity,
        lampDefaultOn
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

    return `${dayName}, ${dayNumber} de ${monthName} de ${year}`;
  }

  static formatClock(date: Date = new Date(), showSeconds: boolean = false): string {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
  }
}
