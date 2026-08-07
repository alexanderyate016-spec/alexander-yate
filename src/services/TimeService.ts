import { checkColombianHoliday, HolidayInfo } from '../utils/colombianHolidays';

export type DayPeriod = 'dawn' | 'morning' | 'midday' | 'sunset' | 'dusk' | 'night';

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
   * Determine day period according to exact thresholds:
   * 🌅 Amanecer: 05:00–07:59 (300 - 479 mins)
   * ☀️ Mañana: 08:00–11:59 (480 - 719 mins)
   * 🌤 Mediodía: 12:00–16:59 (720 - 1019 mins)
   * 🌇 Atardecer: 17:00–19:29 (1020 - 1169 mins)
   * 🌆 Crepúsculo: 19:30–20:59 (1170 - 1259 mins)
   * 🌙 Noche: 21:00–04:59 (1260 - 299 mins)
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
        greeting = `Buenos días, ${userName}. Luz cálida y suave sobre el despacho.`;
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
        greeting = `Buenos días, ${userName}. Jornada activa y llena de energía.`;
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
        label = 'Mediodía';
        greeting = `Buenas tardes, ${userName}. Máxima iluminación y claridad sobre la oficina.`;
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
        greeting = `Buenas tardes, ${userName}. Cálidos tonos dorados al horizonte.`;
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
        greeting = `Buenas noches, ${userName}. Suave transición hacia el descanso.`;
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
        greeting = `Buenas noches, ${userName}. Entorno nocturno elegante y descansado.`;
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
    if (holiday.isHoliday && holiday.name) {
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
